"use client";

import { useEffect, useRef } from "react";


// Kept outside React so nested overlays from different trees agree on which is on top

interface Layer {
    id: number;
    onEscape: () => void;
}

const stack: Layer[] = [];
let nextId = 1;
let listening = false;
let locks = 0;

function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "Escape" || !stack.length || event.defaultPrevented) return;
    event.preventDefault();
    event.stopPropagation();
    stack[stack.length - 1]!.onEscape();
}


export function useLayer(open: boolean, onEscape: () => void) {
    const handler = useRef(onEscape);
    handler.current = onEscape;

    useEffect(() => {
        if (!open) return;
        const layer: Layer = { id: nextId++, onEscape: () => handler.current() };
        stack.push(layer);

        if (!listening) {
            // Capture, so it runs before anything inside the overlay can swallow the key
            window.addEventListener("keydown", onKeyDown, true);
            listening = true;
        }

        return () => {
            const index = stack.findIndex((item) => item.id === layer.id);
            if (index !== -1) stack.splice(index, 1);
            if (!stack.length && listening) {
                window.removeEventListener("keydown", onKeyDown, true);
                listening = false;
            }
        };
    }, [open]);
}


export function useScrollLock(active: boolean) {
    useEffect(() => {
        if (!active) return;
        locks += 1;
        if (locks === 1) {
            const gutter = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = "hidden";
            if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
        }
        return () => {
            locks -= 1;
            if (locks === 0) {
                document.body.style.overflow = "";
                document.body.style.paddingRight = "";
            }
        };
    }, [active]);
}


const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
].join(",");

export function focusableIn(root: HTMLElement): HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (node) => node.tabIndex >= 0 && !node.closest("[inert]") && node.getClientRects().length > 0
    );
}
