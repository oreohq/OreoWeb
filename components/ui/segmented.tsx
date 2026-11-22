"use client";

import { useId, useRef } from "react";
import { spring } from "@/lib/motion";
import { m } from "motion/react";
import cn from "@/lib/cn";


export interface SegmentOption<V extends string> {
    value: V;
    label: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
    title?: string;
}

interface Props<V extends string> {
    options: SegmentOption<V>[];
    value: V;
    onChange: (value: V) => void;
    label?: string;
    labelledBy?: string;
    size?: "sm" | "md";
    className?: string;
    fill?: boolean;
}

export function Segmented<V extends string>({ options, value, onChange, label, labelledBy, size = "md", className, fill }: Props<V>) {
    const group = useRef<HTMLDivElement>(null);
    const thumb = useId();

    const onKeyDown = (event: React.KeyboardEvent, index: number) => {
        const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
        const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
        if (!forward && !back) return;
        event.preventDefault();

        for (let step = 1; step <= options.length; step++) {
            const next = (index + (forward ? step : -step) + options.length) % options.length;
            if (!options[next]!.disabled) {
                onChange(options[next]!.value);
                group.current?.querySelectorAll<HTMLButtonElement>("[role='radio']")[next]?.focus();
                return;
            }
        }
    };

    return (
        <div
            ref={group}
            role="radiogroup"
            aria-label={label}
            aria-labelledby={labelledBy}
            className={cn(
                "inline-flex max-w-full gap-0.5 overflow-x-auto rounded-xl border border-paper/8 bg-ink-900 p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                fill && "flex w-full",
                className
            )}
        >
            {options.map((option, index) => {
                const checked = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        disabled={option.disabled}
                        title={option.title}
                        tabIndex={checked ? 0 : -1}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => onKeyDown(event, index)}
                        className={cn(
                            "relative flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[0.5625rem] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4",
                            size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm",
                            fill && "flex-1",
                            checked ? "text-paper" : "text-paper/65 hover:text-paper/85"
                        )}
                    >
                        {checked && (
                            <m.span
                                layoutId={thumb}
                                transition={spring.snappy}
                                className="absolute inset-0 rounded-[0.5625rem] bg-ink-700 thumb-depth"
                                aria-hidden="true"
                            />
                        )}
                        {option.icon && <span className={cn("relative", checked ? "text-cream-400" : "opacity-70")}>{option.icon}</span>}
                        <span className="relative">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
