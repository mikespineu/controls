import type { Vector3 } from 'three';

export interface PosterItem {
  id: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  z1: number;
  z2: number;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CameraSnapshot {
  position: Vector3;
  target: Vector3;
}

export type ControlsMode = 'group' | 'item';

export interface ControlsState {
  mode: ControlsMode;
  focusedItemId: string | null;
  hasUserMoved: boolean;
  isAtDefaultZoom: boolean;
  margins: Margins;
  isTransitioning: boolean;
  lastGroupCamera: CameraSnapshot;
  defaultGroupCamera: CameraSnapshot;
}

export interface ControlsConfig {
  fov: number;
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed: number;
  rotationLimitX: number;
  rotationLimitY: number;
  rotationSensitivity: number;
  rotationClearance: number;
  transitionDuration: number;
  transitionEase: string;
  exitDuration: number;
  exitEase: string;
  resetDuration: number;
  resetEase: string;
}

export interface PosterWallControlsProps {
  items: PosterItem[];
  children?: React.ReactNode;
  fov?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  rotationLimitY?: number;
  rotationLimitX?: number;
  rotationSensitivity?: number;
  rotationClearance?: number;
  transitionDuration?: number;
  transitionEase?: string;
  exitDuration?: number;
  exitEase?: string;
  resetDuration?: number;
  resetEase?: string;
}

export interface ItemProps {
  item: PosterItem;
  wallOffset?: number;
  children?: React.ReactNode;
}

export interface ItemLabelProps {
  label?: string;
  className?: string;
}

export interface HUDProps {
  className?: string;
}

export interface ItemRuntime {
  id: string;
  meshRef: React.MutableRefObject<import('three').Object3D | null>;
  restingZ: number;
  wallOffset: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}
