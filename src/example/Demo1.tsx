import React from "react";
import { Canvas } from "@react-three/fiber";
import { PosterWallControls, type PosterItem } from "../lib";
import { WallMesh } from "./WallMesh";
import { PosterMesh } from "./PosterMesh";

const POSTER_DEPTH = 1;
const WALL_Z = 0;

function makePoster(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
): PosterItem {
  return {
    id,
    x1: x - w / 2,
    x2: x + w / 2,
    y1: y - h / 2,
    y2: y + h / 2,
    z1: WALL_Z,
    z2: WALL_Z + POSTER_DEPTH,
  };
}

const ITEMS: PosterItem[] = [
  makePoster("a", -70, 35, 32, 45),
  makePoster("b", -25, 35, 45, 32),
  makePoster("c", 30, 40, 48, 67.5),
  makePoster("d", 80, 30, 32, 45),
  makePoster("e", -55, -30, 67.5, 48),
  makePoster("f", 25, -30, 32, 45),
  makePoster("g", 75, -25, 45, 32),
];

const COLORS: Record<string, string> = {
  a: "#e26d5c",
  b: "#f3a738",
  c: "#5fb49c",
  d: "#7884d1",
  e: "#d36b9b",
  f: "#67c0e3",
  g: "#c8d058",
};

export function Demo1() {
  return (
    <PosterWallControls
      items={ITEMS}
      fov={45}
      rotationLimitY={Infinity}
      rotationLimitX={70}
      marginTop={50}
      marginRight={50}
      marginBottom={50}
      marginLeft={50}
    >
      <Canvas
        camera={{ position: [0, 0, 200], fov: 45, near: 0.1, far: 5000 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#0a0a0c"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[50, 80, 120]} intensity={0.8} />
        <directionalLight position={[-100, -50, 100]} intensity={0.3} />

        <PosterWallControls.Scene>
          <WallMesh width={260} height={180} />
          {ITEMS.map((item) => (
            <PosterWallControls.Item key={item.id} item={item}>
              <PosterMesh
                item={item}
                color={COLORS[item.id] ?? "#ccc"}
                label={item.id.toUpperCase()}
              />
              <PosterWallControls.ItemLabel
                label={`Inspect ${item.id.toUpperCase()}`}
              />
            </PosterWallControls.Item>
          ))}
        </PosterWallControls.Scene>
      </Canvas>
      <PosterWallControls.HUD />
    </PosterWallControls>
  );
}
