import { useMemo } from 'react';
import { computeBoundingBox, type BBox } from '../utils/cameraMath';
import type { PosterItem } from '../types';

export function useBoundingBox(items: PosterItem[]): BBox {
  return useMemo(() => computeBoundingBox(items), [items]);
}
