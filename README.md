# poster-wall-controls

Custom React Three Fiber camera controls for interactive poster wall planners.

Compound-component API. **No OrbitControls / CameraControls / drei controls** — every gesture, every frame is implemented from scratch.

## Install

```bash
npm install poster-wall-controls @react-three/fiber @react-three/drei three react react-dom
# gsap is an optional peer dependency; required at runtime for transitions:
npm install gsap
```

Make sure `three` is deduped in your bundler — multiple Three.js copies break R3F.

## Quick start

```tsx
import { Canvas } from '@react-three/fiber';
import { PosterWallControls, type PosterItem } from 'poster-wall-controls';

const items: PosterItem[] = [
  { id: 'a', x1: -16, x2: 16, y1: -22, y2: 22, z1: 0, z2: 1 },
];

function MyWall() {
  return (
    <Canvas camera={{ position: [0, 0, 200], fov: 45, near: 0.1, far: 5000 }}>
      <PosterWallControls items={items} fov={45} rotationLimitY={Infinity}>
        <PosterWallControls.Scene>
          <mesh>
            <boxGeometry args={[260, 180, 1]} />
            <meshStandardMaterial color="#1c1c20" />
          </mesh>
          {items.map((item) => (
            <PosterWallControls.Item key={item.id} item={item}>
              <mesh>
                <boxGeometry args={[item.x2 - item.x1, item.y2 - item.y1, item.z2 - item.z1]} />
                <meshStandardMaterial color="#e26d5c" />
              </mesh>
              <PosterWallControls.ItemLabel />
            </PosterWallControls.Item>
          ))}
        </PosterWallControls.Scene>
        <PosterWallControls.HUD />
      </PosterWallControls>
    </Canvas>
  );
}
```

## Run the example

```bash
npm install
npm run dev
```

Opens `http://localhost:5173` with a demo wall of seven posters.

## Mode reference

| Mode  | Camera                                    | Gesture surface              |
|-------|-------------------------------------------|------------------------------|
| group | Looks at centroid of all items (default)  | pan + zoom over the wall     |
| item  | Locked to one poster's center             | rotate the poster mesh only  |

Transition: click an `ItemLabel` to enter item focus; HUD "Back" button to exit.

## Root props — `<PosterWallControls>`

| Prop                  | Default        | Notes                                          |
|-----------------------|----------------|------------------------------------------------|
| `items`               | —              | Required `PosterItem[]`.                       |
| `fov`                 | `45`           | Perspective FOV in degrees.                    |
| `minZoom` / `maxZoom` | auto           | Camera Z bounds for group mode.                |
| `zoomSpeed`           | `1`            | Wheel multiplier.                              |
| `marginTop/Right/Bottom/Left` | `0`    | cm of padding around bbox (negative allowed).  |
| `rotationLimitY`      | `Infinity`     | Item-focus Y rotation cap (degrees).           |
| `rotationLimitX`      | `80`           | Item-focus X rotation cap (degrees).           |
| `rotationSensitivity` | `0.005`        | Radians per pixel.                             |
| `rotationClearance`   | `2`            | cm clearance for auto `wallOffset`.            |
| `transitionDuration`  | `600`          | ms — enter item focus.                         |
| `transitionEase`      | `power2.inOut` | GSAP ease.                                     |
| `exitDuration` / `exitEase`   | same   | exit item focus.                               |
| `resetDuration` / `resetEase` | same   | reset to default group camera.                 |

## `<PosterWallControls.Item>` props

| Prop          | Default | Notes                                            |
|---------------|---------|--------------------------------------------------|
| `item`        | —       | `PosterItem` whose runtime is registered.        |
| `wallOffset`  | auto    | cm Z-pullout in item focus. Auto: `depth/2 + rotationClearance`. |

## Poster size reference

1 world unit = 1 cm.

| Name         | Width (cm) | Height (cm) |
|--------------|-----------|------------|
| M vertical   | 32        | 45         |
| M horizontal | 45        | 32         |
| L vertical   | 48        | 67.5       |
| L horizontal | 67.5      | 48         |

Use `vertical` / `horizontal` everywhere — never `portrait` / `landscape`.

## Margin system

```
              marginTop
       ┌───────────────────┐
       │ ┌───┐ ┌───┐ ┌───┐ │
marginLeft   posters     marginRight
       │ └───┘ └───┘ └───┘ │
       └───────────────────┘
              marginBottom
```

Camera Z in group mode is recomputed from the bbox + margins so the padded
content fits the viewport. Negative margins zoom in past the bbox edge.

## wallOffset — auto vs manual

In item focus the poster is animated Z-forward by `wallOffset` so its rotated
corners do not clip into the wall.

- Explicit: `<PosterWallControls.Item wallOffset={5}>` (cm)
- Auto: `posterDepth / 2 + rotationClearance` (`rotationClearance` defaults to 2)

The mesh returns to its resting Z on exit. Rotation also resets to `(0, 0, 0)`.

## Pan limits and Y-lock

Pan is clamped so the visible frustum always intersects the combined bbox of
all items — at least one poster stays partially visible.

At default zoom (camera Z within `ZOOM_EPSILON` = 0.5 of default), Y pan is
discarded. This keeps mobile vertical-scroll handoff intact. Zoom in even
slightly and Y pan unlocks.

## Item → item focus transition

Click another poster's focus icon while already focused. A single GSAP
timeline:

1. Current poster rotation → `(0,0,0)`
2. Current poster Z → resting Z
3. Camera → new poster center + safeZ (overlaps step 2)
4. New poster Z → resting Z + wallOffset (stagger after step 3)

`focusedItemId` updates immediately; HUD Back button stays visible; mode
remains `'item'`; clicks blocked during the transition.

## Why custom controls — no OrbitControls

Generic controls impose interaction assumptions that fight this spec:

- OrbitControls orbits around a target — here, group mode is a flat
  pan + zoom along the Z axis, never an orbit.
- The Y-axis lock at default zoom is not an OrbitControls feature.
- Item focus rotates the mesh, not the camera — completely outside the
  OrbitControls model.
- Touch handling (pan vs pinch vs single-finger rotate) must be re-mapped
  per mode, which OrbitControls cannot do.

Custom code on raw pointer events + `useFrame` gives total control with no
hidden state.

## Compound Components — how the pattern is used internally

`<PosterWallControls>` owns all state through a single React Context
(`ControlsContext`). Every sub-component (`Scene`, `Item`, `ItemLabel`, `HUD`)
reads from and writes to that context via `useControlsContext()` — there is
no prop drilling and no monolithic root prop API. Sub-components are attached
as static properties on the root component so consumers compose the API as a
tree.

## GSAP integration

GSAP is an optional peer dependency (`>= 3.12`). It is dynamically imported
on first use; without it, transitions throw:

> `[PosterWallControls] GSAP peer dependency not found. Install gsap >= 3.12.`

All durations / eases are forwarded to `gsap.to()` / timelines verbatim.

## Contributing

```bash
npm install
npm run dev        # run the example app
npm run typecheck  # tsc --noEmit
npm run build      # tsup ESM + CJS
```

Issues and PRs welcome. New behaviour must remain compound-component-shaped
and must never reach for a pre-built controls package.
