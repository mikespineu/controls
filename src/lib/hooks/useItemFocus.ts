import { useFrame } from '@react-three/fiber';
import { consumeFrameDeltas, type PointerState } from './usePointerInput';
import { clamp } from '../utils/cameraMath';
import { DEG2RAD } from '../utils/constants';
import { useControlsContext } from '../context/ControlsContext';
import type { Object3D } from 'three';

interface Args {
  pointer: React.MutableRefObject<PointerState>;
  meshRef: React.MutableRefObject<Object3D | null>;
}

export function useItemFocus({ pointer, meshRef }: Args) {
  const { state, config } = useControlsContext();

  useFrame(() => {
    if (state.mode !== 'item' || state.isTransitioning) return;
    const mesh = meshRef.current;
    if (!mesh) return;
    const p = pointer.current;
    const deltas = consumeFrameDeltas(p);

    const isRotateGesture =
      p.isDragging && (p.dragButton === 'left' || p.touchCount === 1);
    if (!isRotateGesture) return;

    mesh.rotation.y += deltas.dx * config.rotationSensitivity;
    mesh.rotation.x += deltas.dy * config.rotationSensitivity;

    if (config.rotationLimitX !== Infinity) {
      const lx = config.rotationLimitX * DEG2RAD;
      mesh.rotation.x = clamp(mesh.rotation.x, -lx, lx);
    }
    if (config.rotationLimitY !== Infinity) {
      const ly = config.rotationLimitY * DEG2RAD;
      mesh.rotation.y = clamp(mesh.rotation.y, -ly, ly);
    }
  });
}
