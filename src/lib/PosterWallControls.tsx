import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Vector3 } from 'three';
import {
  ControlsContext,
  type ControlsContextValue,
  type Controller,
} from './context/ControlsContext';
import { DEFAULTS } from './utils/constants';
import type {
  ControlsConfig,
  ControlsState,
  InitialMode,
  ItemRuntime,
  Margins,
  PosterItem,
  PosterWallControlsProps,
} from './types';
import { Scene } from './components/Scene';
import { Item } from './components/Item';
import { ItemLabel } from './components/ItemLabel';
import { HUD } from './components/HUD';

function makeDefaultSnapshot() {
  return { position: new Vector3(), target: new Vector3() };
}

function parseInitialMode(
  mode: InitialMode | undefined,
  items: PosterItem[],
): { mode: 'group' | 'item'; focusedItemId: string | null } {
  if (!mode || mode === 'group') return { mode: 'group', focusedItemId: null };
  if (typeof mode === 'string' && mode.startsWith('item-')) {
    const n = Number.parseInt(mode.slice(5), 10);
    if (Number.isFinite(n) && n >= 0 && n < items.length) {
      return { mode: 'item', focusedItemId: items[n].id };
    }
  }
  return { mode: 'group', focusedItemId: null };
}

function PosterWallControlsRoot(props: PosterWallControlsProps) {
  const config: ControlsConfig = useMemo(
    () => ({
      fov: props.fov ?? DEFAULTS.fov,
      minZoom: props.minZoom,
      maxZoom: props.maxZoom,
      zoomSpeed: props.zoomSpeed ?? DEFAULTS.zoomSpeed,
      rotationLimitX: props.rotationLimitX ?? DEFAULTS.rotationLimitX,
      rotationLimitY: props.rotationLimitY ?? DEFAULTS.rotationLimitY,
      rotationSensitivity: props.rotationSensitivity ?? DEFAULTS.rotationSensitivity,
      rotationClearance: props.rotationClearance ?? DEFAULTS.rotationClearance,
      transitionDuration: props.transitionDuration ?? DEFAULTS.transitionDuration,
      transitionEase: props.transitionEase ?? DEFAULTS.transitionEase,
      exitDuration: props.exitDuration ?? DEFAULTS.exitDuration,
      exitEase: props.exitEase ?? DEFAULTS.exitEase,
      resetDuration: props.resetDuration ?? DEFAULTS.resetDuration,
      resetEase: props.resetEase ?? DEFAULTS.resetEase,
    }),
    [
      props.fov,
      props.minZoom,
      props.maxZoom,
      props.zoomSpeed,
      props.rotationLimitX,
      props.rotationLimitY,
      props.rotationSensitivity,
      props.rotationClearance,
      props.transitionDuration,
      props.transitionEase,
      props.exitDuration,
      props.exitEase,
      props.resetDuration,
      props.resetEase,
    ],
  );

  const groupMargins: Margins = useMemo(
    () => ({
      top: props.marginTop ?? DEFAULTS.marginTop,
      right: props.marginRight ?? DEFAULTS.marginRight,
      bottom: props.marginBottom ?? DEFAULTS.marginBottom,
      left: props.marginLeft ?? DEFAULTS.marginLeft,
    }),
    [props.marginTop, props.marginRight, props.marginBottom, props.marginLeft],
  );

  const itemMargins: Margins = useMemo(
    () => ({
      top: props.itemMarginTop ?? DEFAULTS.itemMarginTop,
      right: props.itemMarginRight ?? DEFAULTS.itemMarginRight,
      bottom: props.itemMarginBottom ?? DEFAULTS.itemMarginBottom,
      left: props.itemMarginLeft ?? DEFAULTS.itemMarginLeft,
    }),
    [
      props.itemMarginTop,
      props.itemMarginRight,
      props.itemMarginBottom,
      props.itemMarginLeft,
    ],
  );

  const [state, setState] = useState<ControlsState>(() => {
    const init = parseInitialMode(props.initialMode, props.items);
    return {
      mode: init.mode,
      focusedItemId: init.focusedItemId,
      hasUserMoved: false,
      isAtDefaultZoom: true,
      groupMargins,
      itemMargins,
      isTransitioning: false,
      lastGroupCamera: makeDefaultSnapshot(),
      defaultGroupCamera: makeDefaultSnapshot(),
    };
  });

  React.useEffect(() => {
    setState((s) => ({ ...s, groupMargins }));
  }, [groupMargins]);

  React.useEffect(() => {
    setState((s) => ({ ...s, itemMargins }));
  }, [itemMargins]);

  const controllerRef = useRef<Controller | null>(null);
  const itemRuntimes = useRef<Map<string, ItemRuntime>>(new Map());

  const enterItemFocus = useCallback(
    (id: string) => controllerRef.current?.enterItemFocus(id),
    [],
  );
  const exitItemFocus = useCallback(
    () => controllerRef.current?.exitItemFocus(),
    [],
  );
  const resetGroupCamera = useCallback(
    () => controllerRef.current?.resetGroupCamera(),
    [],
  );

  const registerItem = useCallback((rt: ItemRuntime) => {
    itemRuntimes.current.set(rt.id, rt);
  }, []);
  const unregisterItem = useCallback((id: string) => {
    itemRuntimes.current.delete(id);
  }, []);
  const getItemRuntime = useCallback(
    (id: string) => itemRuntimes.current.get(id),
    [],
  );

  const setHasUserMoved = useCallback(
    (v: boolean) =>
      setState((s) => (s.hasUserMoved === v ? s : { ...s, hasUserMoved: v })),
    [],
  );
  const setIsAtDefaultZoom = useCallback(
    (v: boolean) =>
      setState((s) => (s.isAtDefaultZoom === v ? s : { ...s, isAtDefaultZoom: v })),
    [],
  );
  const setIsTransitioning = useCallback(
    (v: boolean) =>
      setState((s) => (s.isTransitioning === v ? s : { ...s, isTransitioning: v })),
    [],
  );
  const setGroupMargins = useCallback((m: Partial<Margins>) => {
    setState((s) => ({ ...s, groupMargins: { ...s.groupMargins, ...m } }));
  }, []);
  const setItemMargins = useCallback((m: Partial<Margins>) => {
    setState((s) => ({ ...s, itemMargins: { ...s.itemMargins, ...m } }));
  }, []);

  const disabled = !!props.disabled;

  const ctx: ControlsContextValue = useMemo(
    () => ({
      state,
      disabled,
      enterItemFocus,
      exitItemFocus,
      resetGroupCamera,
      setGroupMargins,
      setItemMargins,
      setHasUserMoved,
      setIsAtDefaultZoom,
      setIsTransitioning,
      registerItem,
      unregisterItem,
      getItemRuntime,
      config,
      items: props.items,
      _internal: { setState, controllerRef, itemRuntimes },
    }),
    [
      state,
      disabled,
      enterItemFocus,
      exitItemFocus,
      resetGroupCamera,
      setGroupMargins,
      setItemMargins,
      setHasUserMoved,
      setIsAtDefaultZoom,
      setIsTransitioning,
      registerItem,
      unregisterItem,
      getItemRuntime,
      config,
      props.items,
    ],
  );

  return <ControlsContext.Provider value={ctx}>{props.children}</ControlsContext.Provider>;
}

type PosterWallControlsType = typeof PosterWallControlsRoot & {
  Scene: typeof Scene;
  Item: typeof Item;
  ItemLabel: typeof ItemLabel;
  HUD: typeof HUD;
};

export const PosterWallControls = PosterWallControlsRoot as PosterWallControlsType;
PosterWallControls.Scene = Scene;
PosterWallControls.Item = Item;
PosterWallControls.ItemLabel = ItemLabel;
PosterWallControls.HUD = HUD;
