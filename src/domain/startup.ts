/** Startup screen rules (T-31, T-32). Timings match --motion-startup* in tokens.css. */
export type Readiness = 'starting' | 'ready' | 'error';
export type StartupScreen = 'on' | 'off';

/** The animated sequence, run while the journal opens; any key or click skips it. */
export const STARTUP_SEQUENCE_MS = 1400;
/** The closing collapse, animated motion only. */
export const STARTUP_EXIT_MS = 220;
/** After this, the screen says the journal is still opening. */
export const STARTUP_SLOW_MS = 4000;
/** The screen never stays longer than this, whatever happens. */
export const STARTUP_TIMEOUT_MS = 10000;

export const DEFAULT_STARTUP_SCREEN: StartupScreen = 'on';
export const parseStartupScreen = (value: unknown): StartupScreen => value === 'off' ? 'off' : DEFAULT_STARTUP_SCREEN;

/**
 * Whether the startup screen should leave now. An initialization error leaves at once so
 * it is shown in the app; without animation the screen waits only for readiness; nothing
 * keeps it past the timeout.
 */
export function startupLeaves(readiness: Readiness, elapsedMs: number, animated: boolean, skipped: boolean): boolean {
  if (readiness === 'error' || skipped || elapsedMs >= STARTUP_TIMEOUT_MS) return true;
  return readiness === 'ready' && (!animated || elapsedMs >= STARTUP_SEQUENCE_MS);
}

/** The one line of status text: what is actually happening, never a percentage. */
export function startupMessage(readiness: Readiness, elapsedMs: number): string {
  if (readiness === 'ready') return 'READY';
  if (readiness === 'error') return 'JOURNAL UNAVAILABLE';
  return elapsedMs >= STARTUP_SLOW_MS ? 'STILL OPENING THE JOURNAL' : 'OPENING JOURNAL';
}
