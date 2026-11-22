"use client";

import { AnimatePresence, m, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/motion";


export function FadeIn({ delay = 0, y = 6, ...props }: HTMLMotionProps<"div"> & { delay?: number, y?: number }) {
    return (
        <m.div
            initial={{ opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: EASE_OUT, delay }}
            {...props}
        />
    );
}


export function Collapse({ open, children, className }: { open: boolean, children: React.ReactNode, className?: string }) {
    return (
        <AnimatePresence initial={false}>
            {open && (
                <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                        height: "auto",
                        opacity: 1,
                        transition: { height: { duration: 0.28, ease: EASE_OUT }, opacity: { duration: 0.2, delay: 0.05 } }
                    }}
                    exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.22, ease: EASE_OUT }, opacity: { duration: 0.12 } } }}
                    className="overflow-hidden"
                >
                    <div className={className}>{children}</div>
                </m.div>
            )}
        </AnimatePresence>
    );
}


const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export function AnimatedNumber({
    value,
    format = (n: number) => Math.round(n).toLocaleString("en"),
    duration = 900,
    className
}: {
    value: number;
    format?: (value: number) => string;
    duration?: number;
    className?: string;
}) {
    const reduced = useReducedMotion();
    const node = useRef<HTMLSpanElement>(null);
    const shown = useRef(0);
    const formatter = useRef(format);
    formatter.current = format;
    const [initial] = useState(() => format(0));

    useEffect(() => {
        const element = node.current;
        if (!element) return;
        const start = shown.current;
        if (reduced || start === value) {
            shown.current = value;
            element.textContent = formatter.current(value);
            return;
        }

        let frame = 0;
        const began = performance.now();
        const tick = (now: number) => {
            const progress = Math.min(1, (now - began) / duration);
            shown.current = start + (value - start) * easeOutQuart(progress);
            element.textContent = formatter.current(progress === 1 ? value : shown.current);
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [value, duration, reduced]);

    return (
        <span ref={node} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
            {initial}
        </span>
    );
}
