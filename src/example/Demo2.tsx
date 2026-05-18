import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PosterWallControls, useControlsContext, type PosterItem } from '../lib';
import { WallMesh } from './WallMesh';
import { PosterMesh } from './PosterMesh';

const POSTER_W = 32;
const POSTER_H = 45;
const POSTER_DEPTH = 1;
const WALL_Z = 0;

const COLORS = ['#e26d5c', '#f3a738', '#5fb49c', '#7884d1', '#d36b9b'];

function buildRow(count: number, gap: number): PosterItem[] {
  const totalWidth = count * POSTER_W + (count - 1) * gap;
  const startCenterX = -totalWidth / 2 + POSTER_W / 2;
  const items: PosterItem[] = [];
  for (let i = 0; i < count; i++) {
    const cx = startCenterX + i * (POSTER_W + gap);
    items.push({
      id: `p${i}`,
      x1: cx - POSTER_W / 2,
      x2: cx + POSTER_W / 2,
      y1: -POSTER_H / 2,
      y2: POSTER_H / 2,
      z1: WALL_Z,
      z2: WALL_Z + POSTER_DEPTH,
    });
  }
  return items;
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  padding: 16,
  background: 'rgba(15, 15, 18, 0.85)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: '#eaeaea',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 13,
  lineHeight: 1.4,
  backdropFilter: 'blur(6px)',
  pointerEvents: 'auto',
  zIndex: 5,
  width: 260,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginTop: 10,
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 12,
  opacity: 0.85,
  marginBottom: 4,
};

const navWrap: React.CSSProperties = {
  position: 'fixed',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 8,
  zIndex: 10000,
};

const navButton: React.CSSProperties = {
  background: 'rgba(20,20,20,0.92)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.22)',
  borderRadius: 999,
  padding: '10px 18px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  userSelect: 'none',
  boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
  backdropFilter: 'blur(6px)',
  minWidth: 96,
};

function PrevNextNav() {
  const { state, items, enterItemFocus } = useControlsContext();
  if (state.mode !== 'item' || !state.focusedItemId || items.length < 2) return null;
  const idx = items.findIndex((i) => i.id === state.focusedItemId);
  if (idx < 0) return null;
  const n = items.length;
  const prevId = items[(idx - 1 + n) % n].id;
  const nextId = items[(idx + 1) % n].id;
  const disabled = state.isTransitioning;
  return (
    <div style={navWrap}>
      <button
        type="button"
        style={{ ...navButton, opacity: disabled ? 0.6 : 1 }}
        disabled={disabled}
        onClick={() => enterItemFocus(prevId)}
      >
        ‹ Prev
      </button>
      <span
        style={{
          alignSelf: 'center',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 12,
          minWidth: 48,
          textAlign: 'center',
        }}
      >
        {idx + 1} / {n}
      </span>
      <button
        type="button"
        style={{ ...navButton, opacity: disabled ? 0.6 : 1 }}
        disabled={disabled}
        onClick={() => enterItemFocus(nextId)}
      >
        Next ›
      </button>
    </div>
  );
}

export function Demo2() {
  const [count, setCount] = useState(2);
  const [gap, setGap] = useState(8);

  const items = useMemo(() => buildRow(count, gap), [count, gap]);

  return (
    <>
      <PosterWallControls
        items={items}
        fov={45}
        rotationLimitY={Infinity}
        rotationLimitX={70}
        marginTop={8}
        marginRight={8}
        marginBottom={8}
        marginLeft={8}
      >
        <Canvas
          camera={{ position: [0, 0, 200], fov: 45, near: 0.1, far: 5000 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#0a0a0c']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[50, 80, 120]} intensity={0.8} />
          <directionalLight position={[-100, -50, 100]} intensity={0.3} />

          <PosterWallControls.Scene>
            <WallMesh width={320} height={140} />
            {items.map((item, i) => (
              <PosterWallControls.Item key={item.id} item={item}>
                <PosterMesh
                  item={item}
                  color={COLORS[i % COLORS.length]}
                  label={String(i + 1)}
                />
                <PosterWallControls.ItemLabel label={`Inspect #${i + 1}`} />
              </PosterWallControls.Item>
            ))}
          </PosterWallControls.Scene>
        </Canvas>
        <PosterWallControls.HUD />
        <PrevNextNav />
      </PosterWallControls>

      <div style={panelStyle}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
          Demo 2 — Row builder
        </div>
        <div style={{ opacity: 0.75, fontSize: 12, marginBottom: 8 }}>
          Posters 32×45 cm. Layout computed in demo — library only consumes
          PosterItem[].
        </div>

        <div style={rowStyle}>
          <div style={labelStyle}>
            <span>Quantity</span>
            <span>{count}</span>
          </div>
          <input
            type="range"
            min={2}
            max={5}
            step={1}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>

        <div style={rowStyle}>
          <div style={labelStyle}>
            <span>Gap (cm)</span>
            <span>{gap}</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
          />
        </div>
      </div>
    </>
  );
}
