/** Interface motion levels (T-28). The OS reduced-motion setting always wins over Full. */
export const MOTION_LEVELS = [
  { value: 'full', label: 'Full' },
  { value: 'reduced', label: 'Reduced' },
  { value: 'off', label: 'Off' },
] as const;
export type MotionLevel = (typeof MOTION_LEVELS)[number]['value'];

export const DEFAULT_MOTION: MotionLevel = 'full';

/** A known level, or the default for anything missing or unrecognised. */
export const parseMotion = (value: unknown): MotionLevel => MOTION_LEVELS.find(m => m.value === value)?.value ?? DEFAULT_MOTION;

/** The level actually shown: an OS request for reduced motion turns every animation off. */
export const effectiveMotion = (chosen: MotionLevel, osReduced: boolean): MotionLevel => osReduced ? 'off' : chosen;
