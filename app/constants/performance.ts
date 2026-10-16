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
 * Throttle delay for scroll events on mouse devices in milliseconds
 * Default: 50ms
 */
export const THROTTLE_SCROLL_MOUSE = 50;

/**
 * Throttle delay for scroll events on touch devices in milliseconds
 * Default: 100ms
 * Higher value for touch devices to account for momentum scrolling
 */
export const THROTTLE_SCROLL_TOUCH = 100;

/**
 * Throttle delay for resize events on mouse devices in milliseconds
 * Default: 100ms
 * Prevents excessive recalculation during window resizing
 */
export const THROTTLE_RESIZE_MOUSE = 100;

/**
 * Throttle delay for resize events in milliseconds (legacy alias)
 * Default: 100ms
 * @deprecated Use THROTTLE_RESIZE_MOUSE for clarity
 */
export const THROTTLE_RESIZE = THROTTLE_RESIZE_MOUSE;

/**
 * Throttle delay for resize events on touch devices in milliseconds
 * Default: 200ms
 * Higher value for touch devices due to slower resize transitions
 */
export const THROTTLE_RESIZE_TOUCH = 200;

/**
 * Maximum canvas history size
 * Default: 200 entries
 * Limits memory usage by restricting undo/redo history
 */
export const MAX_HISTORY_SIZE = 200;
