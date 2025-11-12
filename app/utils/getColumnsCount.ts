import { BREAKPOINTS } from "~/constants/breakpoints";

export const getColumnsCount = () => {
    const width = window.innerWidth;
    if (width < BREAKPOINTS.mobile) return 2;
    if (width < BREAKPOINTS.tablet) return 3;
    if (width < BREAKPOINTS.desktop) return 4;
    return 5;
};
