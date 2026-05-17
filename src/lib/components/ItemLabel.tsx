import React from 'react';
import { Html } from '@react-three/drei';
import { useControlsContext } from '../context/ControlsContext';
import { useItemRuntime } from './Item';
import type { ItemLabelProps } from '../types';

export function ItemLabel({ label, className }: ItemLabelProps) {
  const { enterItemFocus, state } = useControlsContext();
  const runtime = useItemRuntime();
  const isFocused = state.focusedItemId === runtime.id && state.mode === 'item';
  const disabled = state.isTransitioning || isFocused;

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    enterItemFocus(runtime.id);
  };

  const baseStyle: React.CSSProperties = {
    pointerEvents: 'auto',
    background: 'rgba(20, 20, 20, 0.85)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 999,
    padding: '6px 10px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 12,
    lineHeight: 1,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    transform: 'translate(-50%, -120%)',
  };

  return (
    <Html
      position={[runtime.width / 2 - runtime.width / 2, runtime.height / 2 + 1, 0]}
      transform={false}
      zIndexRange={[100, 0]}
      occlude={false}
    >
      <button className={className} style={baseStyle} onClick={onClick} disabled={disabled}>
        <span style={{ marginRight: 6 }}>◎</span>
        {label ?? 'Focus'}
      </button>
    </Html>
  );
}
