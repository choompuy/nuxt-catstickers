export const getClickButton = (e: MouseEvent | any) => {
    if (e instanceof MouseEvent) {
        const btn = e.button;

        if (btn === 0 || btn === 1 || btn === 2) {
            return btn;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
};
