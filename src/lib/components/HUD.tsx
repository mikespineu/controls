import React from 'react';
import { useControlsContext } from '../context/ControlsContext';
import type { HUDProps } from '../types';

const buttonStyle: React.CSSProperties = {
  background: 'rgba(20, 20, 20, 0.92)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.22)',
  borderRadius: 10,
  padding: '10px 16px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  userSelect: 'none',
  marginLeft: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
  backdropFilter: 'blur(6px)',
};

const wrapStyle: React.CSSProperties = {
  position: 'fixed',
  top: 16,
  right: 16,
  display: 'flex',
  alignItems: 'center',
  zIndex: 10000,
};

export function HUD({ className }: HUDProps) {
  const { state, exitItemFocus, resetGroupCamera, disabled: controlsDisabled } =
    useControlsContext();
  if (controlsDisabled) return null;
  const inItem = state.mode === 'item';
  const showReset = state.mode === 'group' && state.hasUserMoved;
  const disabled = state.isTransitioning;

  if (!inItem && !showReset) return null;

  return (
    <div className={className} style={wrapStyle}>
      {inItem && (
        <button
          type="button"
          style={{ ...buttonStyle, opacity: disabled ? 0.6 : 1 }}
          disabled={disabled}
          onClick={exitItemFocus}
        >
          ← Back
        </button>
      )}
      {showReset && (
        <button
          type="button"
          style={{ ...buttonStyle, opacity: disabled ? 0.6 : 1 }}
          disabled={disabled}
          onClick={resetGroupCamera}
        >
          ⟳ Reset
        </button>
      )}
    </div>
  );
}
