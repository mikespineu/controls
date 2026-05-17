import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import type { PerspectiveCamera } from 'three';
import { computeGroupFitZ, type BBox } from '../utils/cameraMath';
import type { Margins } from '../types';

export function useMargins(
  bbox: BBox,
  margins: Margins,
  fov: number,
  isActive: boolean,
  onZ?: (z: number) => void,
) {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  useEffect(() => {
    if (!isActive) return;
    const z = computeGroupFitZ(bbox, fov, aspect, margins);
    onZ?.(z);
  }, [bbox, margins, fov, aspect, isActive, onZ]);
}

export function computeMarginAwareGroupZ(
  bbox: BBox,
  margins: Margins,
  camera: PerspectiveCamera,
): number {
  const aspect = camera.aspect;
  return computeGroupFitZ(bbox, camera.fov, aspect, margins);
}
