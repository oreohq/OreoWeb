"use client";

import { useId, useRef } from "react";
import { spring } from "@/lib/motion";
import { m } from "motion/react";
import cn from "@/lib/cn";


export interface TabItem<V extends string> {
    value: V;
    label: React.ReactNode;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
}

interface Props<V extends string> {
    items: TabItem<V>[];
    value: V;
    onChange: (value: V) => void;
    idBase: string;
    label: string;
    look?: "pill" | "line";
    className?: string;
}

export const tabIds = (idBase: string, value: string) => ({ tab: `${idBase}-tab-${value}`, panel: `${idBase}-panel-${value}` });


export function Tabs<V extends string>({ items, value, onChange, idBase, label, look = "pill", className }: Props<V>) {
    const list = useRef<HTMLDivElement>(null);
    const indicator = useId();

    const onKeyDown = (event: React.KeyboardEvent, index: number) => {
        const last = items.length - 1;
        const next =
            event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
            : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
            : event.key === "Home" ? 0
            : event.key === "End" ? last
            : null;
        if (next === null) return;
        event.preventDefault();
        onChange(items[next]!.value);
        list.current?.querySelectorAll<HTMLButtonElement>("[role='tab']")[next]?.focus();
    };

    return (
        <div
            ref={list}
            role="tablist"
            aria-label={label}
            className={cn(
                "flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                look === "pill" ? "gap-0.5 rounded-xl border border-paper/8 bg-ink-900 p-[3px]" : "gap-1 border-b border-paper/8",
                className
            )}
        >
            {items.map((item, index) => {
                const selected = item.value === value;
                const ids = tabIds(idBase, item.value);
                return (
                    <button
                        key={item.value}
                        id={ids.tab}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={ids.panel}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onChange(item.value)}
                        onKeyDown={(event) => onKeyDown(event, index)}
                        className={cn(
                            "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors duration-150 [&_svg]:size-4",
                            look === "pill" ? "h-8 rounded-[0.5625rem] px-3" : "h-10 px-3",
                            selected ? "text-paper" : "text-paper/65 hover:text-paper/85"
                        )}
                    >
                        {selected && (
                            <m.span
                                layoutId={indicator}
                                transition={spring.snappy}
                                className={cn(
                                    "absolute",
                                    look === "pill"
                                        ? "inset-0 rounded-[0.5625rem] bg-ink-700 thumb-depth"
                                        : "inset-x-2 -bottom-px h-0.5 rounded-full bg-cream-500"
                                )}
                                aria-hidden="true"
                            />
                        )}
                        {item.icon && <span className={cn("relative", selected ? "text-cream-400" : "opacity-70")}>{item.icon}</span>}
                        <span className="relative">{item.label}</span>
                        {item.badge && <span className="relative">{item.badge}</span>}
                    </button>
                );
            })}
        </div>
    );
}
