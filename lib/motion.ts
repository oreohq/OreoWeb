import type { Transition } from "motion/react";


export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const spring = {
    snappy: { type: "spring", stiffness: 560, damping: 42, mass: 0.7 },
    smooth: { type: "spring", stiffness: 340, damping: 34, mass: 0.9 },
    layout: { type: "spring", stiffness: 420, damping: 40, mass: 0.8 }
} satisfies Record<string, Transition>;

export const fade = {
    in: { duration: 0.22, ease: EASE_OUT },
    out: { duration: 0.14, ease: [0.4, 0, 1, 1] }
} satisfies Record<string, Transition>;

export const popover = {
    initial: { opacity: 0, scale: 0.96, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.16, ease: EASE_OUT } },
    exit: { opacity: 0, scale: 0.98, y: -2, transition: { duration: 0.1, ease: [0.4, 0, 1, 1] } }
} as const;
