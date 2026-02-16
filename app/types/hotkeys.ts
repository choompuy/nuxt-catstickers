export interface KeyModifiers {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}

export interface KeyDownOptions {
    condition?: Ref<boolean> | (() => boolean);
    target?: Ref<HTMLElement | Window | null> | HTMLElement | Window;
    modifiers?: KeyModifiers;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    once?: boolean;
    passive?: boolean;
}

export type CallbackFn = (event: KeyboardEvent) => void;
