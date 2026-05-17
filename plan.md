# Task: Build PosterWallControls — a React Three Fiber custom camera controls library

## Project overview
Create a production-ready, open-source React Three Fiber (R3F) camera controls library
tailored for an interactive wall poster planner. The library must follow the
**React Compound Components pattern** and be published as a standalone npm package.

Repository name: `poster-wall-controls`
Target audience: Developers building 3D poster/art wall configurators with R3F.

---

## ‼️ CRITICAL RULE #1: React Compound Components pattern — mandatory

The entire public API must be structured as a Compound Component tree.
This is the foundational architectural pattern of this library — not optional.

### What this means in practice

A single root component `<PosterWallControls>` owns all state via a React Context
(`ControlsContext`). Every sub-component (`Scene`, `Item`, `ItemLabel`, `HUD`) reads
from and writes to that context via `useControlsContext()` — a typed hook that throws
if used outside the provider.

```tsx
// Correct — compound component API
<PosterWallControls items={items} fov={45} rotationLimitY={Infinity}>
  <PosterWallControls.Scene>
    <WallMesh />
    {items.map(item => (
      <PosterWallControls.Item key={item.id} item={item} wallOffset={12}>
        <PosterMesh />
        <PosterWallControls.ItemLabel />
      </PosterWallControls.Item>
    ))}
  </PosterWallControls.Scene>
  <PosterWallControls.HUD />
</PosterWallControls>

// Wrong — monolithic props, render props, HOC, or any other pattern
<PosterWallControls items={items} renderItem={...} renderHUD={...} />
```

### Compound component attachment

Sub-components are attached as static properties of the root component:

```ts
PosterWallControls.Scene     = Scene;
PosterWallControls.Item      = Item;
PosterWallControls.ItemLabel = ItemLabel;
PosterWallControls.HUD       = HUD;
```

### Context shape

```ts
// context/ControlsContext.ts — single source of truth for all library state
interface ControlsContextValue {
  state: ControlsState;
  enterItemFocus: (itemId: string) => void;
  exitItemFocus: () => void;
  resetGroupCamera: () => void;
  setMargins: (margins: Partial<Margins>) => void;
  setHasUserMoved: (value: boolean) => void;
  setIsAtDefaultZoom: (value: boolean) => void;
  setIsTransitioning: (value: boolean) => void;
  config: ControlsConfig;
  items: PosterItem[];
}
```

Every sub-component reads exclusively from this context — no prop drilling, no
component-local state that duplicates context state.

---

## ‼️ CRITICAL RULE #2: No pre-built controls — custom implementation only

This library must NOT use `OrbitControls`, `CameraControls`, `MapControls`,
`TrackballControls`, or any other pre-built controls from `@react-three/drei`,
`three/examples/jsm`, or any other package.

All camera movement (pan, zoom), all pointer event handling, and all input
normalization must be implemented from scratch using:
- Raw pointer events on the canvas (`pointerdown`, `pointermove`, `pointerup`)
- Touch events normalized to the same interface as mouse events
- `useFrame` from `@react-three/fiber` to apply computed deltas to the camera
- Direct manipulation of `camera.position` and `camera.lookAt` / quaternion

Rationale: generic controls impose interaction assumptions that conflict with
the mode system, pan limits, Y-lock, and item-focus behaviour in this spec.
Custom controls give complete, predictable control over every frame.

> If at any point the implementor reaches for OrbitControls or any equivalent:
> stop, re-read this section, and implement the behaviour manually instead.

---

## Input handling architecture

All pointer interaction is driven by a single custom hook: `usePointerInput`.
This is the only place in the library where raw DOM events are read.

```ts
interface PointerState {
  isDragging: boolean;
  dragButton: 'left' | 'middle' | 'right' | null;
  touchCount: number;
  delta: { x: number; y: number };   // px moved since last frame
  pinchDelta: number;                 // pinch distance delta (touch zoom)
  position: { x: number; y: number };
}
```

The hook attaches listeners to `useThree().gl.domElement` and returns a ref-based
`PointerState` that is read each frame inside `useFrame`.
Never use React state for per-frame values — use refs to avoid re-render overhead.

Gesture to action mapping:

| Gesture                          | Mode         | Action      |
|----------------------------------|--------------|-------------|
| Middle-mouse drag / right-mouse  | group focus  | pan         |
| Two-finger drag                  | group focus  | pan         |
| Scroll wheel                     | group focus  | zoom        |
| Pinch                            | group focus  | zoom        |
| Left-mouse drag                  | item focus   | rotate mesh |
| Single-finger drag               | item focus   | rotate mesh |

`usePointerInput` checks the current mode from `ControlsContext` before interpreting
any gesture — gestures that do not apply to the current mode are silently ignored.

---

## Animation

All camera transitions are animated with GSAP.
- Declared as an optional peer dependency: `"gsap": ">=3.12"`
- Never bundled by the library. Import: `import gsap from 'gsap'`
- If not found at runtime, throw:
  `[PosterWallControls] GSAP peer dependency not found. Install gsap >= 3.12.`
- All durations and ease strings configurable via props, forwarded to `gsap.to()`.

No other animation library (@react-spring/three, framer-motion, etc.).

---

## Poster item specification

```ts
interface PosterItem {
  id: string;
  x1: number; x2: number;  // world-space X bounds
  y1: number; y2: number;  // world-space Y bounds
  z1: number; z2: number;  // z1 = wall surface, z2 = poster front face
}
```

Supported sizes (1 world unit = 1 cm):

| Name         | Width (cm) | Height (cm) |
|--------------|-----------|------------|
| M vertical   | 32        | 45         |
| M horizontal | 45        | 32         |
| L vertical   | 48        | 67.5       |
| L horizontal | 67.5      | 48         |

Use "vertical" and "horizontal" everywhere. Never "portrait" or "landscape".

The wall mesh is defined by the consumer — the library does not render it.
The Storybook example must include a wall mesh.

---

## wallOffset — Z pull-out distance in item focus

When entering item focus the poster translates forward on Z to clear the wall
during rotation (mesh rotates, camera stays still).

- Explicit: pass `wallOffset` prop on `<PosterWallControls.Item>` (cm, used as-is).
- Auto (omitted): `wallOffset = (posterDepth / 2) + rotationClearance`
  where `posterDepth = Math.abs(item.z2 - item.z1)` and `rotationClearance`
  is a root-level prop (default 2 cm).

GSAP-animates: `item.z2 → item.z2 + wallOffset` on enter, reversed on exit.
Rotation resets to `(0, 0, 0)` on exit — confirmed expected behaviour.

Safe camera Z in item focus:
```
safeZ = (Math.max(itemWidth, itemHeight) / 2) / Math.tan((fov / 2) * DEG2RAD) + wallOffset
```

---

## Camera

Perspective only. FOV configurable via `fov` prop (default 45).
Canvas must have `touch-action: none`.

---

## Mode system

### Mode 1: GROUP FOCUS (default)

Camera looks at centroid of all items. All posters visible.
Camera positioned on Z axis looking toward negative Z (straight at the wall).

Per-frame update pattern (useFrame — no OrbitControls):
```ts
useFrame(() => {
  if (mode !== 'group' || isTransitioning) return;

  if (isPanning()) {
    const panScale = computePanScale(camera, viewportHeight);
    const candidate = target.current.clone().addScaledVector(panDelta, panScale);
    if (isAtDefaultZoom) candidate.y = target.current.y; // Y lock
    target.current.copy(clampToBBox(candidate, allItemsBBox));
    camera.position.x = target.current.x;
    camera.position.y = target.current.y;
  }

  if (isZooming()) {
    camera.position.z = clamp(camera.position.z + zoomDelta, minZoom, maxZoom);
    updateIsAtDefaultZoom(camera.position.z);
  }

  camera.lookAt(target.current);
});
```

#### Pan limits
Clamp camera target X/Y so the visible frustum always intersects the combined
bounding box of all items. At least one poster must remain partially visible.

#### Y-axis pan lock
When `isAtDefaultZoom === true` (camera Z within `ZOOM_EPSILON` of default group Z):
discard the Y component of any pan delta.
Rationale: prevents canvas from stealing vertical scroll on mobile at default view.
Once the user zooms in, `isAtDefaultZoom` becomes false and Y pan unlocks.

`ZOOM_EPSILON` is defined in `constants.ts` (default 0.5 world units).

#### Zoom limits
```ts
minZoom?: number    // default: auto — tightest fit of all items
maxZoom?: number    // default: auto — loosest fit x 2
zoomSpeed?: number  // scroll multiplier, default 1
```

#### Reset button
Shown in HUD when `hasUserMoved === true`.
GSAP-animates camera to `defaultGroupCamera`.
On complete: `hasUserMoved = false`, `isAtDefaultZoom = true`.

---

### Mode 2: ITEM FOCUS

Activated via click on `<PosterWallControls.ItemLabel>` focus icon.

#### Entering item focus
1. Store current camera as `lastGroupCamera` in context.
2. GSAP-animate `camera.position` to `{ x: posterCenterX, y: posterCenterY, z: safeZ }`.
3. Simultaneously GSAP-animate poster mesh `position.z += wallOffset`.
4. `camera.lookAt(posterCenter)` throughout.

#### Rotation (mesh only — camera fixed)
```ts
// Per frame in useFrame, item focus mode only
mesh.rotation.y += deltaX * rotationSensitivity;
mesh.rotation.x += deltaY * rotationSensitivity;

if (rotationLimitX !== Infinity)
  mesh.rotation.x = clamp(mesh.rotation.x, -limitX_rad, limitX_rad);
if (rotationLimitY !== Infinity)
  mesh.rotation.y = clamp(mesh.rotation.y, -limitY_rad, limitY_rad);
// Z axis: never touched — no Z rotation exists in this library
```

- Y axis: `rotationLimitY` prop, default `Infinity` (full 360°)
- X axis: `rotationLimitX` prop, default `80°`
- Z axis: does not exist — no prop, no code, no comment

#### Edge case: item focus → item focus (direct switch)
User clicks another poster's focus icon while already in item focus:
1. Do NOT go through group focus.
2. Single GSAP timeline:
   a. Animate current poster rotation to `(0, 0, 0)`
   b. Animate current poster `position.z` to resting Z
   c. Animate camera to new poster center + safeZ  (overlaps with b)
   d. Animate new poster `position.z` to resting Z + wallOffset  (slight stagger after c)
3. `focusedItemId` updates immediately on click.
4. HUD back button stays visible — mode remains `'item'` throughout.
5. `isTransitioning = true` blocks further clicks during timeline.

#### Exiting item focus
Back button in HUD triggers GSAP timeline:
1. Poster rotation → `(0, 0, 0)`
2. Poster `position.z` → resting Z
3. Camera → `lastGroupCamera` (the position before entering item focus, not the default)
Configurable: `exitDuration`, `exitEase`.

---

## Margin system (both modes)

Root props: `marginTop`, `marginRight`, `marginBottom`, `marginLeft` (cm, accepts negative).
Negative = reduce padding (zoom-in effect). Camera Z recomputed via frustum math on change.

---

## Internal state shape

```ts
interface ControlsState {
  mode: 'group' | 'item';
  focusedItemId: string | null;
  hasUserMoved: boolean;
  isAtDefaultZoom: boolean;
  margins: { top: number; right: number; bottom: number; left: number };
  isTransitioning: boolean;
  lastGroupCamera: CameraSnapshot;
  defaultGroupCamera: CameraSnapshot;
}

interface CameraSnapshot {
  position: Vector3;
  target: Vector3;
}
```

---

## Configurable props — root `<PosterWallControls>`

```ts
interface PosterWallControlsProps {
  items: PosterItem[];
  fov?: number;                    // default 45
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;              // default 1
  marginTop?: number;              // default 0
  marginRight?: number;            // default 0
  marginBottom?: number;           // default 0
  marginLeft?: number;             // default 0
  rotationLimitY?: number;         // default Infinity
  rotationLimitX?: number;         // default 80 (degrees)
  rotationSensitivity?: number;    // default 0.005 (rad/px)
  rotationClearance?: number;      // default 2 cm
  transitionDuration?: number;     // ms, default 600
  transitionEase?: string;         // default "power2.inOut"
  exitDuration?: number;           // ms, default 600
  exitEase?: string;               // default "power2.inOut"
  resetDuration?: number;          // ms, default 600
  resetEase?: string;              // default "power2.inOut"
}
```

`<PosterWallControls.Item>` additional props:
```ts
interface ItemProps {
  item: PosterItem;
  wallOffset?: number;   // explicit Z pull-out (cm); auto-computed if omitted
}
```

---

## File structure

```
poster-wall-controls/
├── src/
│   ├── index.ts
│   ├── PosterWallControls.tsx       // root + provider + static sub-component attachment
│   ├── context/
│   │   └── ControlsContext.ts       // createContext, useControlsContext hook, full types
│   ├── components/
│   │   ├── Scene.tsx                // PosterWallControls.Scene
│   │   ├── Item.tsx                 // PosterWallControls.Item — wallOffset + rotation input
│   │   ├── ItemLabel.tsx            // PosterWallControls.ItemLabel — R3F Html focus icon
│   │   └── HUD.tsx                  // PosterWallControls.HUD — back + reset buttons
│   ├── hooks/
│   │   ├── usePointerInput.ts       // ONLY source of raw pointer/touch events
│   │   ├── useGroupFocus.ts         // useFrame — pan + zoom + limits + Y-lock
│   │   ├── useItemFocus.ts          // useFrame — X/Y rotation only, no Z
│   │   ├── useCameraTransition.ts   // GSAP: enter, exit, item-to-item, reset timelines
│   │   ├── useMargins.ts            // margin → camera Z mapping
│   │   └── useBoundingBox.ts        // world-space bbox of all items
│   ├── utils/
│   │   ├── cameraMath.ts            // safeZ, centroid, frustum, pan clamp helpers
│   │   └── constants.ts             // DEG2RAD, ZOOM_EPSILON, all defaults
│   └── types.ts
├── stories/
│   └── PosterWallControls.stories.tsx
├── README.md
├── package.json
└── tsconfig.json
```

---

## Implementation constraints (in order of priority)

1. Peer deps: `react`, `@react-three/fiber`, `@react-three/drei`, `three`, `gsap` (optional)
2. NO OrbitControls, CameraControls, MapControls, TrackballControls, or any
   pre-built controls from any source — violation = reject the output
3. Compound Components pattern mandatory — all state in ControlsContext, sub-components
   as static properties of root — violation = reject the output
4. All input: `usePointerInput` hook only — no other event listeners anywhere
5. All per-frame updates: `useFrame` only — never React state for frame-rate values
6. GSAP only for animation — no other animation library
7. Full TypeScript — no `any`
8. Tree-shakable ESM + CJS dual build via tsup
9. React 18+ concurrent mode compatible
10. Canvas: `touch-action: none`
11. "vertical" / "horizontal" everywhere — never "portrait" / "landscape"
12. No Z rotation anywhere — no prop, no code, no comment

---

## README sections

1. Installation (GSAP peer dep + bundler deduplication)
2. Quick start
3. Mode reference table (group vs item)
4. Full prop API tables
5. Poster size reference (vertical / horizontal)
6. Margin system with ASCII diagram
7. `wallOffset` — auto vs manual
8. Pan limits and Y-lock behaviour
9. Item-to-item focus transition
10. Why custom controls (no OrbitControls — architectural rationale)
11. Compound Components — how the pattern is used internally
12. GSAP integration note
13. Contributing guide

---

## Deliverable — generate files in this exact order

1.  `types.ts`
2.  `utils/constants.ts`
3.  `utils/cameraMath.ts`
4.  `context/ControlsContext.ts`
5.  `PosterWallControls.tsx`
6.  `hooks/useBoundingBox.ts`
7.  `hooks/useMargins.ts`
8.  `hooks/usePointerInput.ts`
9.  `hooks/useCameraTransition.ts`
10. `hooks/useGroupFocus.ts`
11. `hooks/useItemFocus.ts`
12. `components/Scene.tsx`
13. `components/Item.tsx`
14. `components/ItemLabel.tsx`
15. `components/HUD.tsx`
16. `stories/PosterWallControls.stories.tsx`
17. `README.md`
18. `package.json`
