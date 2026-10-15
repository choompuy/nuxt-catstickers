/**
 * Performance-related constants for canvas and UI interactions
 */

/**
 * Debounce delay for mousemove events in milliseconds
 * Default: 16ms (~60 FPS)
 * Limits mousemove calls to achieve smooth rendering without excessive processing
 */
export const DEBOUNCE_DELAY = 16;

/**
 * Throttle delay for mouse wheel events in milliseconds
 * Default: 50ms
 * Optimal for smooth zoom without overwhelming the event loop
 */
export const THROTTLE_WHEEL = 50;

/**
 * Throttle delay for resize events in milliseconds
 * Default: 100ms
 * Prevents excessive recalculation during window resizing
 */
export const THROTTLE_RESIZE = 100;

/**
 * Maximum canvas history size
 * Default: 200 entries
 * Limits memory usage by restricting undo/redo history
 */
export const MAX_HISTORY_SIZE = 200;
