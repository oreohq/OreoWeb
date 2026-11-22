"use client";

import { focusableIn, useLayer } from "@/components/ui/layers";
import { useEffect, useId, useRef, useState } from "react";
import { useFloating } from "@/components/ui/floating";
import { AnimatePresence, m } from "motion/react";
import { createPortal } from "react-dom";
import { popover } from "@/lib/motion";
import cn from "@/lib/cn";


interface TriggerProps {
    ref: React.RefObject<HTMLButtonElement | null>;
    onClick: () => void;
    "aria-expanded": boolean;
    "aria-controls": string | undefined;
    "aria-haspopup": "dialog";
}

interface Props {
    trigger: (props: TriggerProps, open: boolean) => React.ReactNode;
    children: (close: () => void) => React.ReactNode;
    label: string;
    align?: "start" | "end";
    width?: number;
    className?: string;
}

export function Popover({ trigger, children, label, align = "end", width = 320, className }: Props) {
    const id = useId();
    const button = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const floating = useFloating(button, open, { align, minWidth: width, height: 360 });

    const close = (refocus = true) => {
        setOpen(false);
        if (refocus) button.current?.focus({ preventScroll: true });
    };
    useLayer(open, () => close());

    useEffect(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => {
            const root = panel.current;
            if (root) (focusableIn(root)[0] ?? root).focus({ preventScroll: true });
        });
        return () => cancelAnimationFrame(frame);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (panel.current?.contains(target) || button.current?.contains(target)) return;
            close(false);
        };
        document.addEventListener("pointerdown", onPointerDown, true);
        return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [open]);

    return (
        <>
            {trigger(
                {
                    ref: button,
                    onClick: () => (open ? close() : setOpen(true)),
                    "aria-expanded": open,
                    "aria-controls": open ? `${id}-panel` : undefined,
                    "aria-haspopup": "dialog"
                },
                open
            )}
            {mounted &&
                createPortal(
                    <AnimatePresence>
                        {open && (
                            <m.div
                                ref={panel}
                                id={`${id}-panel`}
                                role="dialog"
                                aria-label={label}
                                tabIndex={-1}
                                onBlur={(event) => {
                                    // The panel sits at the end of <body>, so tabbing out would leave the page
                                    const next = event.relatedTarget as Node | null;
                                    if (!next) close(true);
                                    else if (!panel.current?.contains(next) && !button.current?.contains(next)) close(false);
                                }}
                                style={{ ...floating.style, transformOrigin: floating.side === "below" ? "top right" : "bottom right" }}
                                {...popover}
                                className={cn(
                                    "z-[120] overflow-y-auto overscroll-contain rounded-xl border border-paper/10 bg-ink-850 text-paper shadow-[0_16px_48px_-8px_rgb(0_0_0/0.7)] outline-none",
                                    className
                                )}
                            >
                                {children(() => close(false))}
                            </m.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </>
    );
}
