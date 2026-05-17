import { Vector3, type PerspectiveCamera } from 'three';
import type { Margins, PosterItem } from '../types';
import { DEG2RAD } from './constants';

export interface BBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  centerZ: number;
}

export function computeBoundingBox(items: PosterItem[]): BBox {
  if (items.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      minZ: 0,
      maxZ: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
    };
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const it of items) {
    if (it.x1 < minX) minX = it.x1;
    if (it.x2 > maxX) maxX = it.x2;
    if (it.y1 < minY) minY = it.y1;
    if (it.y2 > maxY) maxY = it.y2;
    if (it.z1 < minZ) minZ = it.z1;
    if (it.z2 > maxZ) maxZ = it.z2;
  }
  return {
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    centerZ: (minZ + maxZ) / 2,
  };
}

export function computeItemSafeZ(
  itemWidth: number,
  itemHeight: number,
  fov: number,
  wallOffset: number,
  itemZ2: number,
): number {
  const largest = Math.max(itemWidth, itemHeight);
  const dist = largest / 2 / Math.tan((fov / 2) * DEG2RAD);
  return itemZ2 + wallOffset + dist;
}

export function computeGroupFitZ(
  bbox: BBox,
  fov: number,
  aspect: number,
  margins: Margins,
): number {
  const paddedWidth = bbox.width + margins.left + margins.right;
  const paddedHeight = bbox.height + margins.top + margins.bottom;
  if (paddedWidth <= 0 && paddedHeight <= 0) return 100;
  const vFov = fov * DEG2RAD;
  const distForHeight = paddedHeight / 2 / Math.tan(vFov / 2);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const distForWidth = paddedWidth / 2 / Math.tan(hFov / 2);
  return Math.max(distForHeight, distForWidth) + bbox.maxZ;
}

export function computePanScale(camera: PerspectiveCamera, viewportHeight: number): number {
  const z = Math.max(0.001, Math.abs(camera.position.z));
  const worldHeightAtZ = 2 * Math.tan((camera.fov * DEG2RAD) / 2) * z;
  return worldHeightAtZ / Math.max(1, viewportHeight);
}

export function visibleSizeAtZ(camera: PerspectiveCamera, distance: number) {
  const d = Math.max(0.001, distance);
  const height = 2 * Math.tan((camera.fov * DEG2RAD) / 2) * d;
  const width = height * camera.aspect;
  return { width, height };
}

export function clamp(v: number, lo: number, hi: number): number {
  if (lo > hi) return v;
  return Math.min(hi, Math.max(lo, v));
}

export function clampTargetToBBox(
  camera: PerspectiveCamera,
  candidate: Vector3,
  bbox: BBox,
): Vector3 {
  const distance = Math.abs(camera.position.z - bbox.maxZ);
  const { width: viewW, height: viewH } = visibleSizeAtZ(camera, distance);
  const halfW = viewW / 2;
  const halfH = viewH / 2;
  const minX = bbox.minX - halfW * 0.5;
  const maxX = bbox.maxX + halfW * 0.5;
  const minY = bbox.minY - halfH * 0.5;
  const maxY = bbox.maxY + halfH * 0.5;
  candidate.x = clamp(candidate.x, minX, maxX);
  candidate.y = clamp(candidate.y, minY, maxY);
  return candidate;
}

export function makeSnapshot(position: Vector3, target: Vector3) {
  return {
    position: position.clone(),
    target: target.clone(),
  };
}
