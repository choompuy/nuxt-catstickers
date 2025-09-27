export const getColumnsCount = () => {
    const width = window.innerWidth;
    if (width < 640) return 2;
    if (width < 900) return 3;
    if (width < 1200) return 4;
    return 5;
};
