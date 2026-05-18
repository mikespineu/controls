export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export const ZOOM_EPSILON = 0.5;

export const DEFAULTS = {
  fov: 45,
  zoomSpeed: 10,
  rotationLimitX: 80,
  rotationLimitY: Infinity,
  rotationSensitivity: 0.005,
  rotationClearance: 2,
  transitionDuration: 600,
  transitionEase: "power2.inOut",
  exitDuration: 600,
  exitEase: "power2.inOut",
  resetDuration: 600,
  resetEase: "power2.inOut",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  itemMarginTop: 0,
  itemMarginRight: 0,
  itemMarginBottom: 0,
  itemMarginLeft: 0,
} as const;

export const GSAP_MISSING_ERROR =
  "[PosterWallControls] GSAP peer dependency not found. Install gsap >= 3.12.";
