import React, { useEffect, useMemo, useRef } from 'react';
import { Group } from 'three';
import { useControlsContext } from '../context/ControlsContext';
import { useItemFocus } from '../hooks/useItemFocus';
import { usePointerContext } from '../context/PointerContext';
import type { ItemProps, ItemRuntime } from '../types';

const ItemRuntimeContext = React.createContext<ItemRuntime | null>(null);

export function useItemRuntime() {
  const v = React.useContext(ItemRuntimeContext);
  if (!v) throw new Error('[PosterWallControls] useItemRuntime outside <PosterWallControls.Item>');
  return v;
}

export function Item({ item, wallOffset, children }: ItemProps) {
  const { registerItem, unregisterItem, config, state } = useControlsContext();
  const groupRef = useRef<Group | null>(null);

  const width = Math.abs(item.x2 - item.x1);
  const height = Math.abs(item.y2 - item.y1);
  const depth = Math.abs(item.z2 - item.z1);
  const centerX = (item.x1 + item.x2) / 2;
  const centerY = (item.y1 + item.y2) / 2;
  const restingZ = (item.z1 + item.z2) / 2;

  const effectiveWallOffset =
    wallOffset !== undefined
      ? wallOffset
      : Math.max(width, height) / 2 + config.rotationClearance;

  const runtime: ItemRuntime = useMemo(
    () => ({
      id: item.id,
      meshRef: groupRef,
      restingZ,
      wallOffset: effectiveWallOffset,
      centerX,
      centerY,
      width,
      height,
    }),
    [item.id, restingZ, effectiveWallOffset, centerX, centerY, width, height],
  );

  useEffect(() => {
    registerItem(runtime);
    return () => unregisterItem(runtime.id);
  }, [runtime, registerItem, unregisterItem]);

  const pointer = usePointerContext();
  const isFocused = state.focusedItemId === item.id && state.mode === 'item';
  const nullRef = useRef<Group | null>(null);
  useItemFocus({ pointer, meshRef: isFocused ? groupRef : nullRef });

  return (
    <ItemRuntimeContext.Provider value={runtime}>
      <group ref={groupRef} position={[centerX, centerY, restingZ]}>
        {children}
      </group>
    </ItemRuntimeContext.Provider>
  );
}
