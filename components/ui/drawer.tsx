"use client";

import { focusableIn, useLayer, useScrollLock } from "@/components/ui/layers";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { X } from "@/components/ui/glyphs";
import { createPortal } from "react-dom";
import { spring } from "@/lib/motion";
import cn from "@/lib/cn";


interface Props {
    open: boolean;
    onClose: () => void;
    label: string;
    children: React.ReactNode;
    className?: string;
}

export function Drawer({ open, onClose, label, children, className }: Props) {
    const [mounted, setMounted] = useState(false);
    const panel = useRef<HTMLDivElement>(null);
    useEffect(() => setMounted(true), []);
    useLayer(open, onClose);
    useScrollLock(open);

    useEffect(() => {
        if (!open) return;
        const opener = document.activeElement as HTMLElement | null;
        const frame = requestAnimationFrame(() => {
            const root = panel.current;
            if (root) (focusableIn(root).find((node) => node.getAttribute("aria-current") === "page") ?? focusableIn(root)[0] ?? root).focus();
        });
        return () => {
            cancelAnimationFrame(frame);
            if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
        };
    }, [open]);

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key !== "Tab" || !panel.current) return;
        const nodes = focusableIn(panel.current);
        if (!nodes.length) return;
        const first = nodes[0]!;
        const last = nodes[nodes.length - 1]!;
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <div key="drawer" className={cn("fixed inset-0 z-[90]", className)} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
                    <m.div
                        className="pointer-events-none absolute inset-0 bg-black/60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.18 } }}
                        aria-hidden="true"
                    />
                    <m.div
                        ref={panel}
                        role="dialog"
                        aria-modal="true"
                        aria-label={label}
                        tabIndex={-1}
                        onKeyDown={onKeyDown}
                        initial={{ x: "-100%" }}
                        animate={{ x: 0, transition: spring.smooth }}
                        exit={{ x: "-100%", transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
                        className="relative flex h-full w-[min(18rem,86vw)] flex-col overflow-y-auto border-r border-paper/10 bg-ink-900 text-paper shadow-[0_0_60px_rgb(0_0_0/0.6)] outline-none"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close navigation"
                            className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg text-paper/65 transition-colors hover:bg-paper/[0.06] hover:text-paper"
                        >
                            <X className="size-4" />
                        </button>
                        {children}
                    </m.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
