import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type PerspectiveCamera } from 'three';
import { useEffect, useRef } from 'react';
import { consumeFrameDeltas, type PointerState } from './usePointerInput';
import {
  clamp,
  clampTargetToBBox,
  computePanScale,
  type BBox,
} from '../utils/cameraMath';
import { ZOOM_EPSILON } from '../utils/constants';
import { useControlsContext } from '../context/ControlsContext';

interface Args {
  pointer: React.MutableRefObject<PointerState>;
  bbox: BBox;
  target: React.MutableRefObject<Vector3>;
  defaultZ: number;
  minZoom: number;
  maxZoom: number;
}

export function useGroupFocus({
  pointer,
  bbox,
  target,
  defaultZ,
  minZoom,
  maxZoom,
}: Args) {
  const { state, config, setHasUserMoved, setIsAtDefaultZoom } = useControlsContext();
  const size = useThree((s) => s.size);
  const movedThisFrame = useRef(false);

  useEffect(() => {
    target.current.set(bbox.centerX, bbox.centerY, bbox.maxZ);
  }, [bbox.centerX, bbox.centerY, bbox.maxZ, target]);

  useFrame(({ camera }) => {
    if (state.mode !== 'group' || state.isTransitioning) return;
    const cam = camera as PerspectiveCamera;
    const p = pointer.current;
    const deltas = consumeFrameDeltas(p);
    movedThisFrame.current = false;

    const isPanGesture = p.isDragging;
    const atDefault = Math.abs(cam.position.z - defaultZ) < ZOOM_EPSILON;

    if (isPanGesture && (deltas.dx !== 0 || deltas.dy !== 0)) {
      const scale = computePanScale(cam, size.height);
      const candidate = target.current.clone();
      candidate.x -= deltas.dx * scale;
      candidate.y += deltas.dy * scale;
      if (atDefault) candidate.y = target.current.y;
      clampTargetToBBox(cam, candidate, bbox);
      target.current.copy(candidate);
      cam.position.x = target.current.x;
      cam.position.y = target.current.y;
      movedThisFrame.current = true;
    }

    if (deltas.wheel !== 0 || deltas.pinch !== 0) {
      const zoomDelta =
        deltas.wheel * 0.1 * config.zoomSpeed - deltas.pinch * 0.2 * config.zoomSpeed;
      const next = clamp(cam.position.z + zoomDelta, minZoom, maxZoom);
      if (next !== cam.position.z) {
        cam.position.z = next;
        movedThisFrame.current = true;
      }
    }

    if (atDefault !== state.isAtDefaultZoom) {
      setIsAtDefaultZoom(atDefault);
    }

    if (movedThisFrame.current && !state.hasUserMoved) {
      setHasUserMoved(true);
    }

    cam.lookAt(target.current);
  });
}
