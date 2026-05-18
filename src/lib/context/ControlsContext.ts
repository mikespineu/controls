import { createContext, useContext, type MutableRefObject } from 'react';
import { Vector3 } from 'three';
import type {
  ControlsConfig,
  ControlsState,
  ItemRuntime,
  Margins,
  PosterItem,
} from '../types';

export interface Controller {
  enterItemFocus: (id: string) => void;
  exitItemFocus: () => void;
  resetGroupCamera: () => void;
}

export interface ControlsInternal {
  setState: React.Dispatch<React.SetStateAction<ControlsState>>;
  controllerRef: MutableRefObject<Controller | null>;
  itemRuntimes: MutableRefObject<Map<string, ItemRuntime>>;
}

export interface ControlsContextValue {
  state: ControlsState;
  disabled: boolean;
  enterItemFocus: (itemId: string) => void;
  exitItemFocus: () => void;
  resetGroupCamera: () => void;
  setGroupMargins: (margins: Partial<Margins>) => void;
  setItemMargins: (margins: Partial<Margins>) => void;
  setHasUserMoved: (value: boolean) => void;
  setIsAtDefaultZoom: (value: boolean) => void;
  setIsTransitioning: (value: boolean) => void;
  registerItem: (runtime: ItemRuntime) => void;
  unregisterItem: (id: string) => void;
  getItemRuntime: (id: string) => ItemRuntime | undefined;
  config: ControlsConfig;
  items: PosterItem[];
  _internal: ControlsInternal;
}

export const ControlsContext = createContext<ControlsContextValue | null>(null);

export function useControlsContext(): ControlsContextValue {
  const ctx = useContext(ControlsContext);
  if (!ctx) {
    throw new Error(
      '[PosterWallControls] useControlsContext must be used inside <PosterWallControls>.',
    );
  }
  return ctx;
}

export function emptySnapshot() {
  return { position: new Vector3(), target: new Vector3() };
}
