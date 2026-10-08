import React from "react";
import { Text } from "@react-three/drei";
import type { PosterItem } from "../lib";

interface PosterMeshProps {
  item: PosterItem;
  color: string;
  label: string;
}

export function PosterMesh({ item, color, label }: PosterMeshProps) {
  const width = Math.abs(item.x2 - item.x1);
  const height = Math.abs(item.y2 - item.y1);
  const depth = Math.abs(item.z2 - item.z1);
  const faceZ = depth / 2;

  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, faceZ]} renderOrder={1}>
        <planeGeometry args={[width * 0.86, height * 0.86]} />
        <meshStandardMaterial
          color="#fafafa"
          roughness={0.4}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
      <Text
        position={[0, 0, faceZ]}
        fontSize={Math.min(width, height) * 0.32}
        color={color}
        anchorX="center"
        anchorY="middle"
        depthOffset={-4}
        renderOrder={2}
      >
        {label}
      </Text>
    </group>
  );
}
