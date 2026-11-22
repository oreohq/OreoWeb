"use client";

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { useFloating } from "@/components/ui/floating";
import { AnimatePresence, m } from "motion/react";
import { useLayer } from "@/components/ui/layers";
import { createPortal } from "react-dom";
import { popover } from "@/lib/motion";
import Link from "next/link";
import cn from "@/lib/cn";


const MenuContext = createContext<{ close: (refocus?: boolean) => void }>({ close: () => {} });

interface TriggerProps {
    ref: React.RefObject<HTMLButtonElement | null>;
    id: string;
    onClick: () => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string | undefined;
}

interface Props {
    trigger: (props: TriggerProps, open: boolean) => React.ReactNode;
    children: React.ReactNode;
    align?: "start" | "end";
    width?: number;
    className?: string;
    label?: string;
}

export function Menu({ trigger, children, align = "start", width = 260, className, label }: Props) {
    const id = useId();
    const button = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const focusLast = useRef(false);
    useEffect(() => setMounted(true), []);

    const floating = useFloating(button, open, { align, minWidth: width, height: 420 });

    const close = (refocus = true) => {
        setOpen(false);
        if (refocus) button.current?.focus({ preventScroll: true });
    };

    useLayer(open, () => close());

    const items = () =>
        [...(panel.current?.querySelectorAll<HTMLElement>("[role='menuitem']:not([aria-disabled='true'])") ?? [])];

    useEffect(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => {
            const list = items();
            (focusLast.current ? list[list.length - 1] : list[0])?.focus({ preventScroll: true });
            focusLast.current = false;
        });
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (panel.current?.contains(target) || button.current?.contains(target)) return;
            close(false);
        };
        document.addEventListener("pointerdown", onPointerDown, true);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("pointerdown", onPointerDown, true);
        };
    }, [open]);

    const onMenuKeyDown = (event: React.KeyboardEvent) => {
        const list = items();
        const index = list.indexOf(document.activeElement as HTMLElement);
        const move = (next: number) => {
            event.preventDefault();
            list[(next + list.length) % list.length]?.focus();
        };
        switch (event.key) {
            case "ArrowDown": return move(index + 1);
            case "ArrowUp": return move(index - 1);
            case "Home": return move(0);
            case "End": return move(list.length - 1);
            case "Tab":
                event.preventDefault();
                close();
                return;
        }
    };

    const triggerProps: TriggerProps = {
        ref: button,
        id: `${id}-trigger`,
        onClick: () => (open ? close() : setOpen(true)),
        onKeyDown: (event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                focusLast.current = event.key === "ArrowUp";
                setOpen(true);
            }
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? `${id}-menu` : undefined
    };

    return (
        <MenuContext.Provider value={{ close }}>
            {trigger(triggerProps, open)}
            {mounted &&
                createPortal(
                    <AnimatePresence>
                        {open && (
                            <m.div
                                ref={panel}
                                id={`${id}-menu`}
                                role="menu"
                                aria-label={label}
                                aria-labelledby={label ? undefined : `${id}-trigger`}
                                onKeyDown={onMenuKeyDown}
                                style={{ ...floating.style, transformOrigin: floating.side === "below" ? "top" : "bottom" }}
                                {...popover}
                                className={cn(
                                    "z-[120] overflow-y-auto overscroll-contain rounded-xl border border-paper/10 bg-ink-850 p-1 text-paper shadow-[0_16px_48px_-8px_rgb(0_0_0/0.7)]",
                                    className
                                )}
                            >
                                {children}
                            </m.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </MenuContext.Provider>
    );
}


const itemClasses =
    "flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-paper/80 outline-none transition-colors duration-100 hover:bg-paper/[0.06] hover:text-paper focus-visible:bg-paper/[0.07] focus-visible:text-paper focus-visible:outline-none [&_svg]:size-4";

interface ItemProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    onSelect?: () => void;
    tone?: "default" | "danger";
    disabled?: boolean;
    className?: string;
}

export function MenuItem({ children, icon, onSelect, tone = "default", disabled, className }: ItemProps) {
    const { close } = useContext(MenuContext);
    return (
        <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            aria-disabled={disabled || undefined}
            onClick={() => {
                if (disabled) return;
                close(false);
                onSelect?.();
            }}
            className={cn(
                itemClasses,
                tone === "danger" && "text-[var(--color-bad-300)] hover:bg-bad/10 hover:text-[var(--color-bad-250)] focus-visible:bg-bad/10",
                disabled && "cursor-not-allowed opacity-45",
                className
            )}
        >
            {icon && <span className="shrink-0 opacity-60">{icon}</span>}
            {children}
        </button>
    );
}

interface LinkProps {
    href: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    external?: boolean;
    active?: boolean;
    className?: string;
}

export function MenuLink({ href, children, icon, external, active, className }: LinkProps) {
    const { close } = useContext(MenuContext);
    return (
        <Link
            href={href}
            prefetch={false}
            role="menuitem"
            tabIndex={-1}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            aria-current={active ? "page" : undefined}
            onClick={() => close(false)}
            className={cn(itemClasses, active && "bg-paper/[0.06] text-paper", className)}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </Link>
    );
}

export function MenuSeparator() {
    return <div role="separator" className="-mx-1 my-1 h-px bg-paper/8" />;
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-2.5 pb-1 pt-2 text-xs font-medium text-paper/55" role="presentation">
            {children}
        </div>
    );
}
