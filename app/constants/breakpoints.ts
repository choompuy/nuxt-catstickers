export const BREAKPOINTS = {
    mobile: 600,
    tablet: 900,
    desktop: 1280,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;
