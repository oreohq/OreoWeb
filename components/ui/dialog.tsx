"use client";

import { focusableIn, useLayer, useScrollLock } from "@/components/ui/layers";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { EASE_OUT, spring } from "@/lib/motion";
import { X } from "@/components/ui/glyphs";
import { createPortal } from "react-dom";
import cn from "@/lib/cn";


interface Props {
    open: boolean;
    onClose: () => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    initialFocus?: React.RefObject<HTMLElement | null>;
    dismissible?: boolean;
    tone?: "default" | "danger";
    className?: string;
}

const widths = { sm: "sm:max-w-[26rem]", md: "sm:max-w-[32rem]", lg: "sm:max-w-[42rem]", xl: "sm:max-w-[50rem]" };


export function Dialog({
    open,
    onClose,
    title,
    description,
    icon,
    children,
    footer,
    size = "md",
    initialFocus,
    dismissible = true,
    tone = "default",
    className
}: Props) {
    const [mounted, setMounted] = useState(false);
    const panel = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => setMounted(true), []);
    useLayer(open, () => dismissible && onClose());
    useScrollLock(open);

    useEffect(() => {
        if (!open) return;
        const opener = document.activeElement as HTMLElement | null;

        const frame = requestAnimationFrame(() => {
            const root = panel.current;
            if (!root) return;
            const body = root.querySelector<HTMLElement>("[data-dialog-body]");
            const target =
                initialFocus?.current ??
                root.querySelector<HTMLElement>("[data-autofocus]") ??
                (body ? focusableIn(body)[0] : undefined) ??
                focusableIn(root).find((node) => !node.hasAttribute("data-dialog-close")) ??
                root;
            target.focus({ preventScroll: true });
        });

        return () => {
            cancelAnimationFrame(frame);
            if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
        };
    }, [open]);

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key !== "Tab" || !panel.current) return;
        const nodes = focusableIn(panel.current);
        if (!nodes.length) {
            event.preventDefault();
            return;
        }
        const first = nodes[0]!;
        const last = nodes[nodes.length - 1]!;
        const active = document.activeElement;

        if (event.shiftKey && (active === first || !panel.current.contains(active))) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (active === last || !panel.current.contains(active))) {
            event.preventDefault();
            first.focus();
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <div
                    key="dialog"
                    className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && dismissible) onClose();
                    }}
                >
                    <m.div
                        className="pointer-events-none absolute inset-0 bg-black/65 backdrop-blur-[3px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } }}
                        exit={{ opacity: 0, transition: { duration: 0.16 } }}
                        aria-hidden="true"
                    />

                    <m.div
                        ref={panel}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={description ? descriptionId : undefined}
                        tabIndex={-1}
                        onKeyDown={onKeyDown}
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1, transition: { ...spring.smooth, opacity: { duration: 0.18 } } }}
                        exit={{ opacity: 0, y: 10, scale: 0.985, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
                        className={cn(
                            "relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[1.25rem] border border-paper/10 bg-ink-850 text-paper shadow-[0_24px_80px_-12px_rgb(0_0_0/0.75)] outline-none sm:rounded-[1.25rem]",
                            widths[size],
                            className
                        )}
                    >
                        <header className="flex items-start gap-3 px-5 pb-1 pt-5 sm:px-6">
                            {icon && (
                                <span
                                    className={cn(
                                        "grid size-9 shrink-0 place-items-center rounded-[0.625rem] border [&_svg]:size-[1.125rem]",
                                        tone === "danger" ? "border-bad/20 bg-bad/10 text-[var(--color-bad-300)]" : "border-paper/10 bg-ink-800 text-paper/75"
                                    )}
                                    aria-hidden="true"
                                >
                                    {icon}
                                </span>
                            )}
                            <div className="min-w-0 flex-1 pt-0.5">
                                <h2 id={titleId} className="font-display text-xl text-paper">
                                    {title}
                                </h2>
                                {description && (
                                    <p id={descriptionId} className="mt-0.5 text-sm leading-relaxed text-paper/70">
                                        {description}
                                    </p>
                                )}
                            </div>
                            {dismissible && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close"
                                    data-dialog-close
                                    className="-mr-1 grid size-8 shrink-0 place-items-center rounded-lg border border-paper/8 bg-ink-800 text-paper/70 transition-colors hover:border-paper/15 hover:text-paper"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </header>

                        {children && (
                            <div data-dialog-body className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-6">
                                {children}
                            </div>
                        )}

                        {footer && (
                            <footer className="flex flex-col-reverse gap-2 border-t border-paper/8 bg-ink-900/60 px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6">
                                {footer}
                            </footer>
                        )}
                    </m.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
