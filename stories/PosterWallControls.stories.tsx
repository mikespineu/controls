import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PosterWallControls, type PosterItem } from '../src/lib';

export default {
  title: 'PosterWallControls',
};

const items: PosterItem[] = [
  { id: 'a', x1: -40, x2: -8, y1: -10, y2: 35, z1: 0, z2: 1 },
  { id: 'b', x1: 5, x2: 53, y1: -34, y2: 33.5, z1: 0, z2: 1 },
  { id: 'c', x1: 60, x2: 92, y1: 10, y2: 55, z1: 0, z2: 1 },
];

export const Default = () => (
  <div style={{ width: '100vw', height: '100vh', background: '#0a0a0c', position: 'relative' }}>
    <PosterWallControls items={items} fov={45} marginTop={5} marginRight={5} marginBottom={5} marginLeft={5}>
      <Canvas camera={{ position: [0, 0, 200], fov: 45, near: 0.1, far: 5000 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[50, 80, 120]} intensity={0.6} />
        <PosterWallControls.Scene>
          <mesh position={[20, 10, -0.5]}>
            <boxGeometry args={[200, 140, 1]} />
            <meshStandardMaterial color="#1c1c20" />
          </mesh>
          {items.map((item) => {
            const w = item.x2 - item.x1;
            const h = item.y2 - item.y1;
            return (
              <PosterWallControls.Item key={item.id} item={item}>
                <mesh>
                  <boxGeometry args={[w, h, item.z2 - item.z1]} />
                  <meshStandardMaterial color="#e26d5c" />
                </mesh>
                <PosterWallControls.ItemLabel />
              </PosterWallControls.Item>
            );
          })}
        </PosterWallControls.Scene>
      </Canvas>
      <PosterWallControls.HUD />
    </PosterWallControls>
  </div>
);
