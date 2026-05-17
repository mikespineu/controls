import React from 'react';
import type { PointerState } from '../hooks/usePointerInput';

export const PointerContext = React.createContext<React.MutableRefObject<PointerState> | null>(
  null,
);

export function usePointerContext() {
  const v = React.useContext(PointerContext);
  if (!v) throw new Error('[PosterWallControls] PointerContext missing.');
  return v;
}
