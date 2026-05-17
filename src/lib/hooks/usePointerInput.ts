import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

export type DragButton = 'left' | 'middle' | 'right' | null;

export interface PointerState {
  isDragging: boolean;
  dragButton: DragButton;
  touchCount: number;
  delta: { x: number; y: number };
  pinchDelta: number;
  position: { x: number; y: number };
  zoomDelta: number;
}

function emptyState(): PointerState {
  return {
    isDragging: false,
    dragButton: null,
    touchCount: 0,
    delta: { x: 0, y: 0 },
    pinchDelta: 0,
    position: { x: 0, y: 0 },
    zoomDelta: 0,
  };
}

export function usePointerInput(enabled: boolean = true) {
  const state = useRef<PointerState>(emptyState());
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    if (!enabled) return;
    const el = gl.domElement;
    el.style.touchAction = 'none';

    let lastX = 0;
    let lastY = 0;
    let lastPinchDist: number | null = null;
    const activeTouches = new Map<number, { x: number; y: number }>();

    const buttonFor = (b: number): DragButton =>
      b === 0 ? 'left' : b === 1 ? 'middle' : b === 2 ? 'right' : null;

    const onContextMenu = (e: Event) => e.preventDefault();

    const onPointerDown = (e: PointerEvent) => {
      el.setPointerCapture?.(e.pointerId);
      lastX = e.clientX;
      lastY = e.clientY;
      state.current.position = { x: e.clientX, y: e.clientY };

      if (e.pointerType === 'touch') {
        activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        state.current.touchCount = activeTouches.size;
        if (activeTouches.size >= 2) {
          state.current.isDragging = true;
          state.current.dragButton = 'middle';
          lastPinchDist = pinchDistance();
        } else {
          state.current.isDragging = true;
          state.current.dragButton = 'left';
        }
      } else {
        state.current.isDragging = true;
        state.current.dragButton = buttonFor(e.button);
      }
    };

    const pinchDistance = () => {
      if (activeTouches.size < 2) return 0;
      const pts = Array.from(activeTouches.values()).slice(0, 2);
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      return Math.hypot(dx, dy);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!state.current.isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      if (e.pointerType === 'touch') {
        if (activeTouches.has(e.pointerId)) {
          activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }
        if (activeTouches.size >= 2) {
          const dist = pinchDistance();
          if (lastPinchDist !== null) {
            state.current.pinchDelta += dist - lastPinchDist;
          }
          lastPinchDist = dist;
          let cx = 0;
          let cy = 0;
          for (const p of activeTouches.values()) {
            cx += p.x;
            cy += p.y;
          }
          cx /= activeTouches.size;
          cy /= activeTouches.size;
          state.current.delta.x += cx - (state.current.position.x || cx);
          state.current.delta.y += cy - (state.current.position.y || cy);
          state.current.position = { x: cx, y: cy };
        } else {
          state.current.delta.x += dx;
          state.current.delta.y += dy;
          state.current.position = { x: e.clientX, y: e.clientY };
        }
      } else {
        state.current.delta.x += dx;
        state.current.delta.y += dy;
        state.current.position = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      el.releasePointerCapture?.(e.pointerId);
      if (e.pointerType === 'touch') {
        activeTouches.delete(e.pointerId);
        state.current.touchCount = activeTouches.size;
        if (activeTouches.size < 2) {
          lastPinchDist = null;
        }
        if (activeTouches.size === 0) {
          state.current.isDragging = false;
          state.current.dragButton = null;
        }
      } else {
        state.current.isDragging = false;
        state.current.dragButton = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.current.zoomDelta += e.deltaY;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('pointerleave', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('contextmenu', onContextMenu);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('pointerleave', onPointerUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('contextmenu', onContextMenu);
    };
  }, [enabled, gl]);

  return state;
}

export function consumeFrameDeltas(state: PointerState) {
  const out = {
    dx: state.delta.x,
    dy: state.delta.y,
    pinch: state.pinchDelta,
    wheel: state.zoomDelta,
  };
  state.delta.x = 0;
  state.delta.y = 0;
  state.pinchDelta = 0;
  state.zoomDelta = 0;
  return out;
}
