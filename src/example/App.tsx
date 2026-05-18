import React, { useState } from 'react';
import { Demo1 } from './Demo1';
import { Demo2 } from './Demo2';

type DemoKey = 'demo1' | 'demo2';

const switcherStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 4,
  padding: 4,
  background: 'rgba(15,15,18,0.9)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  zIndex: 50,
  backdropFilter: 'blur(6px)',
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 14px',
  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
  border: 'none',
  borderRadius: 6,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
});

export function App() {
  const [demo, setDemo] = useState<DemoKey>('demo1');

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {demo === 'demo1' && <Demo1 />}
      {demo === 'demo2' && <Demo2 />}

      <div style={switcherStyle}>
        <button style={tabStyle(demo === 'demo1')} onClick={() => setDemo('demo1')}>
          Demo 1 — Static wall
        </button>
        <button style={tabStyle(demo === 'demo2')} onClick={() => setDemo('demo2')}>
          Demo 2 — Sliders
        </button>
      </div>
    </div>
  );
}
