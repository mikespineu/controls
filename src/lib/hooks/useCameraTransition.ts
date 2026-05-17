import { useCallback, useEffect, useState } from 'react';
import { Vector3, type PerspectiveCamera, type Object3D } from 'three';
import { GSAP_MISSING_ERROR } from '../utils/constants';
import type { CameraSnapshot, ControlsConfig } from '../types';

type GsapModule = typeof import('gsap')['gsap'] | typeof import('gsap')['default'];

let gsapInstance: GsapModule | null = null;
let gsapLoadAttempted = false;

async function loadGsap(): Promise<GsapModule> {
  if (gsapInstance) return gsapInstance;
  try {
    const mod = await import(/* @vite-ignore */ 'gsap');
    gsapInstance = (mod as { default?: GsapModule; gsap?: GsapModule }).default
      ?? (mod as { gsap?: GsapModule }).gsap
      ?? (mod as unknown as GsapModule);
    return gsapInstance!;
  } catch {
    throw new Error(GSAP_MISSING_ERROR);
  }
}

export function useCameraTransition() {
  const [ready, setReady] = useState<boolean>(!!gsapInstance);

  useEffect(() => {
    if (gsapInstance || gsapLoadAttempted) {
      setReady(!!gsapInstance);
      return;
    }
    gsapLoadAttempted = true;
    loadGsap()
      .then(() => setReady(true))
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const enterItemFocus = useCallback(
    (opts: {
      camera: PerspectiveCamera;
      mesh: Object3D;
      target: Vector3;
      targetTo: Vector3;
      camTo: Vector3;
      meshZFrom: number;
      meshZTo: number;
      duration: number;
      ease: string;
      onComplete?: () => void;
    }) => {
      const g = gsapInstance;
      if (!g) throw new Error(GSAP_MISSING_ERROR);
      const dur = opts.duration / 1000;
      const tl = g.timeline({ onComplete: opts.onComplete });
      tl.to(
        opts.target,
        {
          x: opts.targetTo.x,
          y: opts.targetTo.y,
          z: opts.targetTo.z,
          duration: dur,
          ease: opts.ease,
        },
        0,
      );
      tl.to(
        opts.camera.position,
        {
          x: opts.camTo.x,
          y: opts.camTo.y,
          z: opts.camTo.z,
          duration: dur,
          ease: opts.ease,
          onUpdate: () => opts.camera.lookAt(opts.target),
        },
        0,
      );
      tl.to(
        opts.mesh.position,
        {
          z: opts.meshZTo,
          duration: dur,
          ease: opts.ease,
        },
        0,
      );
      return tl;
    },
    [],
  );

  const exitItemFocus = useCallback(
    (opts: {
      camera: PerspectiveCamera;
      mesh: Object3D;
      target: Vector3;
      camTo: Vector3;
      camTargetTo: Vector3;
      meshZTo: number;
      duration: number;
      ease: string;
      onComplete?: () => void;
    }) => {
      const g = gsapInstance;
      if (!g) throw new Error(GSAP_MISSING_ERROR);
      const dur = opts.duration / 1000;
      const tl = g.timeline({ onComplete: opts.onComplete });
      tl.to(opts.mesh.rotation, { x: 0, y: 0, z: 0, duration: dur, ease: opts.ease }, 0);
      tl.to(opts.mesh.position, { z: opts.meshZTo, duration: dur, ease: opts.ease }, 0);
      tl.to(
        opts.target,
        {
          x: opts.camTargetTo.x,
          y: opts.camTargetTo.y,
          z: opts.camTargetTo.z,
          duration: dur,
          ease: opts.ease,
        },
        0,
      );
      tl.to(
        opts.camera.position,
        {
          x: opts.camTo.x,
          y: opts.camTo.y,
          z: opts.camTo.z,
          duration: dur,
          ease: opts.ease,
          onUpdate: () => opts.camera.lookAt(opts.target),
        },
        0,
      );
      return tl;
    },
    [],
  );

  const itemToItem = useCallback(
    (opts: {
      camera: PerspectiveCamera;
      fromMesh: Object3D;
      toMesh: Object3D;
      target: Vector3;
      targetTo: Vector3;
      camTo: Vector3;
      fromMeshZRest: number;
      toMeshZRest: number;
      toMeshZTarget: number;
      duration: number;
      ease: string;
      onComplete?: () => void;
    }) => {
      const g = gsapInstance;
      if (!g) throw new Error(GSAP_MISSING_ERROR);
      const dur = opts.duration / 1000;
      const tl = g.timeline({ onComplete: opts.onComplete });
      tl.to(opts.fromMesh.rotation, { x: 0, y: 0, z: 0, duration: dur * 0.5, ease: opts.ease }, 0);
      tl.to(opts.fromMesh.position, { z: opts.fromMeshZRest, duration: dur * 0.5, ease: opts.ease }, 0);
      tl.to(
        opts.target,
        {
          x: opts.targetTo.x,
          y: opts.targetTo.y,
          z: opts.targetTo.z,
          duration: dur,
          ease: opts.ease,
        },
        dur * 0.25,
      );
      tl.to(
        opts.camera.position,
        {
          x: opts.camTo.x,
          y: opts.camTo.y,
          z: opts.camTo.z,
          duration: dur,
          ease: opts.ease,
          onUpdate: () => opts.camera.lookAt(opts.target),
        },
        dur * 0.25,
      );
      tl.to(
        opts.toMesh.position,
        {
          z: opts.toMeshZTarget,
          duration: dur * 0.5,
          ease: opts.ease,
        },
        dur * 0.5,
      );
      return tl;
    },
    [],
  );

  const resetCamera = useCallback(
    (opts: {
      camera: PerspectiveCamera;
      target: Vector3;
      snapshot: CameraSnapshot;
      duration: number;
      ease: string;
      onComplete?: () => void;
    }) => {
      const g = gsapInstance;
      if (!g) throw new Error(GSAP_MISSING_ERROR);
      const dur = opts.duration / 1000;
      const tl = g.timeline({ onComplete: opts.onComplete });
      tl.to(
        opts.camera.position,
        {
          x: opts.snapshot.position.x,
          y: opts.snapshot.position.y,
          z: opts.snapshot.position.z,
          duration: dur,
          ease: opts.ease,
        },
        0,
      );
      tl.to(
        opts.target,
        {
          x: opts.snapshot.target.x,
          y: opts.snapshot.target.y,
          z: opts.snapshot.target.z,
          duration: dur,
          ease: opts.ease,
          onUpdate: () => opts.camera.lookAt(opts.target),
        },
        0,
      );
      return tl;
    },
    [],
  );

  return { ready, enterItemFocus, exitItemFocus, itemToItem, resetCamera };
}

export function timelinesForConfig(config: ControlsConfig) {
  return {
    transitionDuration: config.transitionDuration,
    transitionEase: config.transitionEase,
    exitDuration: config.exitDuration,
    exitEase: config.exitEase,
    resetDuration: config.resetDuration,
    resetEase: config.resetEase,
  };
}
