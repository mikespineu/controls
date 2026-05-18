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

const toggleStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  width: 44,
  height: 44,
  borderRadius: 22,
  background: 'rgba(20,20,20,0.92)',
  border: '1px solid rgba(255,255,255,0.22)',
  color: '#fff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 18,
  cursor: 'pointer',
  userSelect: 'none',
  zIndex: 10001,
  boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};

export function App() {
  const [demo, setDemo] = useState<DemoKey>('demo1');
  const [chromeVisible, setChromeVisible] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {demo === 'demo1' && <Demo1 chromeVisible={chromeVisible} />}
      {demo === 'demo2' && <Demo2 chromeVisible={chromeVisible} />}

      {chromeVisible && (
        <div style={switcherStyle}>
          <button style={tabStyle(demo === 'demo1')} onClick={() => setDemo('demo1')}>
            Demo 1 — Static wall
          </button>
          <button style={tabStyle(demo === 'demo2')} onClick={() => setDemo('demo2')}>
            Demo 2 — Sliders
          </button>
        </div>
      )}

      <button
        type="button"
        style={toggleStyle}
        title={chromeVisible ? 'Hide UI' : 'Show UI'}
        onClick={() => setChromeVisible((v) => !v)}
      >
        {chromeVisible ? '⊟' : '⊞'}
      </button>
    </div>
  );
}
