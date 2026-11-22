"use client";

import { cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import cn from "@/lib/cn";


interface Props {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: "top" | "bottom";
    className?: string;
    block?: boolean;
    focusable?: boolean;
    label?: string;
}

/** Extra info only. Touch screens can't hover, so anything people need must be on the page too. */
export function Tooltip({ content, children, side = "top", className, block, focusable, label }: Props) {
    const id = useId();
    const trigger = useRef<HTMLSpanElement>(null);
    const tip = useRef<HTMLDivElement>(null);
    const timer = useRef<number | null>(null);
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null);

    const show = (delay: number) => {
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setOpen(true), delay);
    };
    const hide = () => {
        if (timer.current) window.clearTimeout(timer.current);
        setOpen(false);
        setPosition(null);
    };

    useEffect(() => () => {
        if (timer.current) window.clearTimeout(timer.current);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && hide();
        window.addEventListener("keydown", onKey);
        window.addEventListener("scroll", hide, true);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("scroll", hide, true);
        };
    }, [open]);

    useLayoutEffect(() => {
        if (!open || !trigger.current || !tip.current) return;
        const rect = trigger.current.getBoundingClientRect();
        const box = tip.current.getBoundingClientRect();
        const viewport = document.documentElement.clientWidth;

        let top = side === "top" ? rect.top - box.height - 8 : rect.bottom + 8;
        if (side === "top" && top < 8) top = rect.bottom + 8;
        if (side === "bottom" && top + box.height > window.innerHeight - 8) top = rect.top - box.height - 8;
        const left = Math.max(8, Math.min(rect.left + rect.width / 2 - box.width / 2, viewport - box.width - 8));
        setPosition({ top, left });
    }, [open, side, content]);

    const child =
        !focusable && isValidElement<{ "aria-describedby"?: string }>(children)
            ? cloneElement(children, { "aria-describedby": open ? id : undefined })
            : children;

    return (
        <span
            ref={trigger}
            className={cn(block ? "flex" : "inline-flex", focusable && "rounded-md", className)}
            onMouseEnter={() => show(250)}
            onMouseLeave={hide}
            onFocus={() => show(0)}
            onBlur={hide}
            tabIndex={focusable ? 0 : undefined}
            role={focusable && label ? "img" : undefined}
            aria-label={focusable ? label : undefined}
            aria-describedby={focusable && open ? id : undefined}
        >
            {child}
            {open &&
                createPortal(
                    <div
                        ref={tip}
                        id={id}
                        role="tooltip"
                        style={{ position: "fixed", top: position?.top ?? -9999, left: position?.left ?? -9999 }}
                        className={cn(
                            "pointer-events-none z-[130] max-w-72 rounded-lg border border-paper/10 bg-ink-950 px-2.5 py-1.5 text-xs leading-relaxed text-paper/85 shadow-[0_8px_24px_-4px_rgb(0_0_0/0.6)]",
                            position ? "popover-in" : "opacity-0"
                        )}
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </span>
    );
}
