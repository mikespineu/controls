import React from 'react';

interface WallMeshProps {
  width: number;
  height: number;
}

export function WallMesh({ width, height }: WallMeshProps) {
  return (
    <group>
      <mesh position={[0, 0, -0.5]} receiveShadow>
        <boxGeometry args={[width, height, 1]} />
        <meshStandardMaterial color="#1c1c20" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0, -0.49]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#23232a" roughness={0.9} />
      </mesh>
    </group>
  );
}
