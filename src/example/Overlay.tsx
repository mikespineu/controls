import React, { useState } from 'react';

export function Overlay() {
  const [open, setOpen] = useState(true);

  const wrap: React.CSSProperties = {
    position: 'absolute',
    top: 16,
    left: 16,
    maxWidth: 320,
    padding: 16,
    background: 'rgba(15, 15, 18, 0.85)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#eaeaea',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 13,
    lineHeight: 1.5,
    backdropFilter: 'blur(6px)',
    pointerEvents: 'auto',
    zIndex: 5,
  };

  const title: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    letterSpacing: 0.2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const li: React.CSSProperties = { marginBottom: 4 };

  return (
    <div style={wrap}>
      <div style={title}>
        <span>PosterWallControls — Demo</span>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            background: 'transparent',
            color: '#aaa',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: 11,
          }}
        >
          {open ? 'hide' : 'show'}
        </button>
      </div>
      {open && (
        <div>
          <div style={{ opacity: 0.85, marginBottom: 8 }}>
            Compound-component R3F controls — no OrbitControls, full custom input.
          </div>
          <div style={{ fontWeight: 600, marginTop: 8, marginBottom: 4 }}>Group focus</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li style={li}>Middle / right drag — pan</li>
            <li style={li}>Two-finger drag — pan (touch)</li>
            <li style={li}>Scroll wheel / pinch — zoom</li>
            <li style={li}>Y axis locked at default zoom</li>
          </ul>
          <div style={{ fontWeight: 600, marginTop: 8, marginBottom: 4 }}>Item focus</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li style={li}>Click ◎ on a poster to focus</li>
            <li style={li}>Left drag / single touch — rotate</li>
            <li style={li}>Back button in HUD — exit</li>
            <li style={li}>Click another ◎ — direct switch</li>
          </ul>
        </div>
      )}
    </div>
  );
}
