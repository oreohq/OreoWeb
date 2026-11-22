"use client";

import { CircleAlert, CircleCheck, ExternalLink, Info, LoaderCircle, X } from "@/components/ui/glyphs";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { errorMessage } from "@/lib/api/client";
import { spring } from "@/lib/motion";
import cn from "@/lib/cn";


type Tone = "success" | "error" | "info" | "loading";

interface ToastAction {
    label: string;
    href?: string;
    external?: boolean;
    onClick?: () => void;
}

interface ToastInput {
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastAction;
    duration?: number;
    id?: number;
}

interface ToastItem extends ToastInput {
    id: number;
    tone: Tone;
}

export interface ToastApi {
    success: (title: React.ReactNode, options?: Omit<ToastInput, "title">) => number;
    error: (error: unknown, options?: Omit<ToastInput, "title"> & { title?: React.ReactNode }) => number;
    info: (title: React.ReactNode, options?: Omit<ToastInput, "title">) => number;
    loading: (title: React.ReactNode, options?: Omit<ToastInput, "title">) => number;
    dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
    const api = useContext(ToastContext);
    if (!api) throw new Error("useToast must be used inside <ToastProvider>");
    return api;
}

const DURATION: Record<Tone, number> = { success: 4500, info: 6000, error: 9000, loading: 0 };
let nextId = 1;


export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: number) => setToasts((list) => list.filter((toast) => toast.id !== id)), []);

    const push = useCallback((tone: Tone, input: ToastInput) => {
        const id = input.id ?? nextId++;
        const toast: ToastItem = { duration: DURATION[tone], ...input, id, tone };
        setToasts((list) => {
            const exists = list.some((item) => item.id === id);
            return exists ? list.map((item) => (item.id === id ? toast : item)) : [...list, toast].slice(-4);
        });
        return id;
    }, []);

    const api = useMemo<ToastApi>(
        () => ({
            success: (title, options) => push("success", { ...options, title }),
            info: (title, options) => push("info", { ...options, title }),
            loading: (title, options) => push("loading", { ...options, title }),
            error: (error, options) => {
                const message = typeof error === "string" ? error : errorMessage(error);
                return options?.title
                    ? push("error", { ...options, title: options.title, description: options.description ?? message })
                    : push("error", { ...options, title: message });
            },
            dismiss
        }),
        [push, dismiss]
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div
                aria-live="polite"
                className="pointer-events-none fixed inset-x-3 bottom-3 z-[140] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:items-end"
            >
                <AnimatePresence initial={false}>
                    {toasts.map((toast) => (
                        <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}


const icons: Record<Tone, React.ReactNode> = {
    success: <CircleCheck className="size-[1.125rem] text-ok" />,
    error: <CircleAlert className="size-[1.125rem] text-[var(--color-bad-300)]" />,
    info: <Info className="size-[1.125rem] text-paper/75" />,
    loading: <LoaderCircle className="size-[1.125rem] animate-spin text-paper/75" />
};

function Toast({ toast, onDismiss }: { toast: ToastItem, onDismiss: () => void }) {
    const [paused, setPaused] = useState(false);
    const remaining = useRef(toast.duration ?? 0);
    const started = useRef(Date.now());

    useEffect(() => {
        remaining.current = toast.duration ?? 0;
    }, [toast]);

    useEffect(() => {
        if (paused || !remaining.current) return;
        started.current = Date.now();
        const timer = window.setTimeout(onDismiss, remaining.current);
        return () => {
            window.clearTimeout(timer);
            remaining.current = Math.max(1200, remaining.current - (Date.now() - started.current));
        };
    }, [paused, onDismiss, toast]);

    return (
        <m.div
            layout
            role={toast.tone === "error" ? "alert" : "status"}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: spring.smooth }}
            exit={{ opacity: 0, x: 24, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
            transition={spring.layout}
            className={cn(
                "pointer-events-auto flex w-full max-w-[22rem] items-start gap-2.5 rounded-xl border bg-ink-800 p-3 pr-2 text-paper shadow-[0_16px_48px_-12px_rgb(0_0_0/0.7)]",
                toast.tone === "error" ? "border-bad/25" : "border-paper/10"
            )}
        >
            <span className="mt-px shrink-0" aria-hidden="true">
                {icons[toast.tone]}
            </span>
            <div className="min-w-0 flex-1">
                <div className="text-sm font-medium leading-snug text-paper">{toast.title}</div>
                {toast.description && <div className="mt-0.5 text-sm leading-relaxed text-paper/70">{toast.description}</div>}
                {toast.action && (
                    toast.action.href ? (
                        <a
                            href={toast.action.href}
                            target={toast.action.external ? "_blank" : undefined}
                            rel={toast.action.external ? "noreferrer" : undefined}
                            className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-cream-400 hover:text-cream-300"
                        >
                            {toast.action.label}
                            {toast.action.external && <ExternalLink className="size-3.5" />}
                        </a>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                toast.action?.onClick?.();
                                onDismiss();
                            }}
                            className="mt-1.5 text-sm font-medium text-cream-400 hover:text-cream-300"
                        >
                            {toast.action.label}
                        </button>
                    )
                )}
            </div>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss notification"
                className="grid size-6 shrink-0 place-items-center rounded-md text-paper/55 transition-colors hover:bg-paper/[0.08] hover:text-paper"
            >
                <X className="size-3.5" />
            </button>
        </m.div>
    );
}
