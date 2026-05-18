import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3, type PerspectiveCamera } from 'three';
import { useControlsContext } from '../context/ControlsContext';
import { PointerContext } from '../context/PointerContext';
import { useBoundingBox } from '../hooks/useBoundingBox';
import { useGroupFocus } from '../hooks/useGroupFocus';
import { usePointerInput } from '../hooks/usePointerInput';
import { useCameraTransition } from '../hooks/useCameraTransition';
import {
  computeGroupFitZ,
  computeItemFramingFit,
  makeSnapshot,
} from '../utils/cameraMath';

interface SceneProps {
  children?: React.ReactNode;
}

export function Scene({ children }: SceneProps) {
  const ctx = useControlsContext();
  const { state, config, items, _internal } = ctx;
  const { setState, controllerRef, itemRuntimes } = _internal;

  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);

  const bbox = useBoundingBox(items);

  const targetRef = useRef<Vector3>(new Vector3(bbox.centerX, bbox.centerY, bbox.maxZ));

  const aspect = size.width / Math.max(1, size.height);
  const defaultGroupZ = useMemo(
    () => computeGroupFitZ(bbox, config.fov, aspect, state.margins),
    [bbox, config.fov, aspect, state.margins],
  );

  const minZoom = config.minZoom ?? defaultGroupZ * 0.25;
  const maxZoom = config.maxZoom ?? defaultGroupZ * 2;

  const defaultSnapshot = useMemo(
    () =>
      makeSnapshot(
        new Vector3(bbox.centerX, bbox.centerY, defaultGroupZ),
        new Vector3(bbox.centerX, bbox.centerY, bbox.maxZ),
      ),
    [bbox.centerX, bbox.centerY, bbox.maxZ, defaultGroupZ],
  );

  useEffect(() => {
    setState((s) => ({ ...s, defaultGroupCamera: defaultSnapshot }));
  }, [defaultSnapshot, setState]);

  useEffect(() => {
    if (state.mode === 'group' && !state.hasUserMoved && !state.isTransitioning) {
      camera.position.copy(defaultSnapshot.position);
      targetRef.current.copy(defaultSnapshot.target);
      camera.lookAt(targetRef.current);
    }
  }, [defaultSnapshot, state.mode, state.hasUserMoved, state.isTransitioning, camera]);

  useEffect(() => {
    camera.fov = config.fov;
    camera.updateProjectionMatrix();
  }, [camera, config.fov]);

  const pointer = usePointerInput(true);
  const transitions = useCameraTransition();

  const enterItemFocus = useCallback(
    (itemId: string) => {
      if (state.isTransitioning) return;
      if (!transitions.ready) return;
      const target = itemRuntimes.current.get(itemId);
      if (!target?.meshRef.current) return;
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      const fit = computeItemFramingFit(
        target.width,
        target.height,
        config.fov,
        aspect,
        state.margins,
        target.wallOffset,
        item.z2,
      );

      const fromGroup = state.mode === 'group';
      const lastGroup = fromGroup
        ? makeSnapshot(camera.position, targetRef.current)
        : state.lastGroupCamera;
      const tx = target.centerX + fit.offsetX;
      const ty = target.centerY + fit.offsetY;
      const newTarget = new Vector3(tx, ty, item.z2);
      const camTo = new Vector3(tx, ty, fit.safeZ);

      if (fromGroup) {
        setState((s) => ({
          ...s,
          mode: 'item',
          focusedItemId: itemId,
          isTransitioning: true,
          lastGroupCamera: lastGroup,
        }));
        transitions.enterItemFocus({
          camera,
          mesh: target.meshRef.current,
          target: targetRef.current,
          targetTo: newTarget,
          camTo,
          meshZFrom: target.restingZ,
          meshZTo: target.restingZ + target.wallOffset,
          duration: config.transitionDuration,
          ease: config.transitionEase,
          onComplete: () => {
            targetRef.current.copy(newTarget);
            camera.lookAt(targetRef.current);
            setState((s) => ({ ...s, isTransitioning: false }));
          },
        });
      } else {
        const fromId = state.focusedItemId;
        const fromRuntime = fromId ? itemRuntimes.current.get(fromId) : undefined;
        if (!fromRuntime?.meshRef.current) return;
        setState((s) => ({ ...s, focusedItemId: itemId, isTransitioning: true }));
        transitions.itemToItem({
          camera,
          fromMesh: fromRuntime.meshRef.current,
          toMesh: target.meshRef.current,
          target: targetRef.current,
          targetTo: newTarget,
          camTo,
          fromMeshZRest: fromRuntime.restingZ,
          toMeshZRest: target.restingZ,
          toMeshZTarget: target.restingZ + target.wallOffset,
          duration: config.transitionDuration,
          ease: config.transitionEase,
          onComplete: () => {
            targetRef.current.copy(newTarget);
            camera.lookAt(targetRef.current);
            setState((s) => ({ ...s, isTransitioning: false }));
          },
        });
      }
    },
    [
      state.isTransitioning,
      state.mode,
      state.focusedItemId,
      state.lastGroupCamera,
      state.margins,
      transitions,
      items,
      config.fov,
      config.transitionDuration,
      config.transitionEase,
      camera,
      aspect,
      itemRuntimes,
      setState,
    ],
  );

  const exitItemFocus = useCallback(() => {
    if (state.mode !== 'item' || !state.focusedItemId) return;
    if (state.isTransitioning) return;
    if (!transitions.ready) return;
    const rt = itemRuntimes.current.get(state.focusedItemId);
    if (!rt?.meshRef.current) return;
    setState((s) => ({ ...s, isTransitioning: true }));
    transitions.exitItemFocus({
      camera,
      mesh: rt.meshRef.current,
      target: targetRef.current,
      camTo: state.lastGroupCamera.position.clone(),
      camTargetTo: state.lastGroupCamera.target.clone(),
      meshZTo: rt.restingZ,
      duration: config.exitDuration,
      ease: config.exitEase,
      onComplete: () => {
        targetRef.current.copy(state.lastGroupCamera.target);
        camera.lookAt(targetRef.current);
        setState((s) => ({
          ...s,
          mode: 'group',
          focusedItemId: null,
          isTransitioning: false,
        }));
      },
    });
  }, [
    state.mode,
    state.focusedItemId,
    state.isTransitioning,
    state.lastGroupCamera,
    transitions,
    camera,
    itemRuntimes,
    config.exitDuration,
    config.exitEase,
    setState,
  ]);

  const resetGroupCamera = useCallback(() => {
    if (state.isTransitioning) return;
    if (!transitions.ready) return;
    setState((s) => ({ ...s, isTransitioning: true }));
    transitions.resetCamera({
      camera,
      target: targetRef.current,
      snapshot: state.defaultGroupCamera,
      duration: config.resetDuration,
      ease: config.resetEase,
      onComplete: () => {
        setState((s) => ({
          ...s,
          hasUserMoved: false,
          isAtDefaultZoom: true,
          isTransitioning: false,
        }));
      },
    });
  }, [
    state.isTransitioning,
    state.defaultGroupCamera,
    transitions,
    camera,
    config.resetDuration,
    config.resetEase,
    setState,
  ]);

  controllerRef.current = { enterItemFocus, exitItemFocus, resetGroupCamera };

  return (
    <PointerContext.Provider value={pointer}>
      <GroupFocusRunner
        target={targetRef}
        bbox={bbox}
        defaultZ={defaultGroupZ}
        minZoom={minZoom}
        maxZoom={maxZoom}
      />
      <group>{children}</group>
    </PointerContext.Provider>
  );
}

function GroupFocusRunner(props: {
  target: React.MutableRefObject<Vector3>;
  bbox: ReturnType<typeof useBoundingBox>;
  defaultZ: number;
  minZoom: number;
  maxZoom: number;
}) {
  const pointer = React.useContext(PointerContext)!;
  useGroupFocus({
    pointer,
    bbox: props.bbox,
    target: props.target,
    defaultZ: props.defaultZ,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
  });
  return null;
}
