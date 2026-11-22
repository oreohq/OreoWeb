"use client";

import { Check, Plus, Search, TriangleAlert, X } from "@/components/ui/glyphs";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ComboOption } from "@/components/ui/combobox";
import { useFloating } from "@/components/ui/floating";
import { inputClasses } from "@/components/ui/field";
import { AnimatePresence, m } from "motion/react";
import { useLayer } from "@/components/ui/layers";
import { createPortal } from "react-dom";
import { popover } from "@/lib/motion";
import cn from "@/lib/cn";


interface Props<V extends string> {
    id?: string;
    values: V[];
    onChange: (values: V[]) => void;
    options: ComboOption<V>[];
    max?: number;
    placeholder?: string;
    addLabel?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    missingLabel?: string;
    disabled?: boolean;
    invalid?: boolean;
    className?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
}


export function MultiCombobox<V extends string>({
    id,
    values,
    onChange,
    options,
    max = Infinity,
    placeholder = "Nothing picked",
    addLabel = "Add",
    searchPlaceholder = "Search…",
    emptyText = "Nothing matches that.",
    missingLabel = "Unknown",
    disabled,
    invalid,
    className,
    ...aria
}: Props<V>) {
    const autoId = useId();
    const triggerId = id ?? `${autoId}-trigger`;
    const listboxId = `${autoId}-listbox`;
    const optionId = (index: number) => `${autoId}-option-${index}`;

    const trigger = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const listbox = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const full = values.length >= max;
    const withSearch = options.length > 7;
    const byValue = useMemo(() => new Map(options.map((option) => [option.value, option])), [options]);

    const items = useMemo(() => {
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        return options.filter((option) => {
            if (!words.length) return true;
            const haystack = `${option.label} ${option.group ?? ""} ${option.keywords ?? ""}`.toLowerCase();
            return words.every((word) => haystack.includes(word));
        });
    }, [options, query]);

    const floating = useFloating(trigger, open, { matchWidth: true, minWidth: 260, height: 340 });

    const blocked = (option: ComboOption<V>) => Boolean(option.disabled) || (full && !values.includes(option.value));

    const usable = (from: number, step: 1 | -1) => {
        for (let index = from; index >= 0 && index < items.length; index += step) {
            if (!blocked(items[index]!)) return index;
        }
        return -1;
    };

    const close = (refocus = true) => {
        setOpen(false);
        setQuery("");
        if (refocus) trigger.current?.focus({ preventScroll: true });
    };

    const toggle = (option: ComboOption<V> | undefined) => {
        if (!option || blocked(option)) return;
        onChange(values.includes(option.value) ? values.filter((value) => value !== option.value) : [...values, option.value]);
    };

    useEffect(() => {
        if (open) setActive(Math.max(usable(0, 1), 0));
    }, [open, query]);

    useEffect(() => {
        if (!open || withSearch) return;
        const frame = requestAnimationFrame(() => listbox.current?.focus({ preventScroll: true }));
        return () => cancelAnimationFrame(frame);
    }, [open, withSearch]);

    useEffect(() => {
        if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
    }, [active, open]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (panel.current?.contains(target) || trigger.current?.contains(target)) return;
            close(false);
        };
        document.addEventListener("pointerdown", onPointerDown, true);
        return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [open]);

    useLayer(open, () => close());

    const onListKeyDown = (event: React.KeyboardEvent) => {
        switch (event.key) {
            case "ArrowDown": {
                event.preventDefault();
                const next = usable(active + 1, 1);
                setActive(next === -1 ? Math.max(usable(0, 1), 0) : next);
                break;
            }
            case "ArrowUp": {
                event.preventDefault();
                const previous = usable(active - 1, -1);
                setActive(previous === -1 ? Math.max(usable(items.length - 1, -1), 0) : previous);
                break;
            }
            case "Enter":
            case " ":
                if (event.key === " " && withSearch && query) return;
                event.preventDefault();
                toggle(items[active]);
                break;
            case "Tab":
                close();
                break;
        }
    };

    const activeId = items.length ? optionId(active) : undefined;

    return (
        <>
            <div
                className={cn(
                    inputClasses,
                    "flex min-h-10 flex-wrap items-center gap-1.5 p-1.5",
                    open && "border-cream-400/60 ring-[3px] ring-cream-500/15",
                    invalid && "border-bad/60",
                    disabled && "opacity-50",
                    className
                )}
            >
                {values.length === 0 && <span className="px-1.5 text-sm text-paper/50">{placeholder}</span>}

                {values.map((value) => {
                    const option = byValue.get(value);
                    return (
                        <span
                            key={value}
                            className={cn(
                                "inline-flex h-7 max-w-full items-center gap-1.5 rounded-lg border bg-ink-750 pl-2 pr-1 text-sm [&_svg]:size-3.5",
                                option ? "border-paper/10 text-paper" : "border-warn/35 text-warn/90"
                            )}
                        >
                            {option ? option.icon && <span className="shrink-0">{option.icon}</span> : <TriangleAlert aria-hidden="true" />}
                            <span className="truncate" title={option ? undefined : missingLabel}>{option ? option.label : missingLabel}</span>
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => onChange(values.filter((item) => item !== value))}
                                aria-label={`Remove ${option?.label ?? missingLabel}`}
                                className="grid size-5 shrink-0 place-items-center rounded-md text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-500/40"
                            >
                                <X aria-hidden="true" />
                            </button>
                        </span>
                    );
                })}

                <button
                    ref={trigger}
                    id={triggerId}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={open ? listboxId : undefined}
                    aria-invalid={invalid || undefined}
                    disabled={disabled || (full && !open)}
                    onClick={() => (open ? close() : (setQuery(""), setOpen(true)))}
                    onKeyDown={(event) => {
                        if (["ArrowDown", "ArrowUp"].includes(event.key)) {
                            event.preventDefault();
                            setOpen(true);
                        }
                    }}
                    className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-sm font-medium text-paper/75 transition-colors hover:bg-paper/[0.06] hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-500/40 disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-3.5"
                    {...aria}
                >
                    <Plus aria-hidden="true" />
                    {full ? `Up to ${max}` : addLabel}
                </button>
            </div>

            {mounted &&
                createPortal(
                    <AnimatePresence>
                        {open && (
                            <m.div
                                ref={panel}
                                style={{
                                    ...floating.style,
                                    maxHeight: Math.min(Number(floating.style.maxHeight ?? 360), 360),
                                    transformOrigin: floating.side === "above" ? "bottom" : "top"
                                }}
                                {...popover}
                                className="z-[120] flex flex-col overflow-hidden rounded-xl border border-paper/10 bg-ink-850 text-paper shadow-[0_16px_48px_-8px_rgb(0_0_0/0.7)]"
                            >
                                {withSearch && (
                                    <div className="relative shrink-0 border-b border-paper/8 p-1.5">
                                        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-paper/50" aria-hidden="true" />
                                        <input
                                            autoFocus
                                            type="text"
                                            role="combobox"
                                            aria-expanded="true"
                                            aria-controls={listboxId}
                                            aria-activedescendant={activeId}
                                            aria-autocomplete="list"
                                            aria-label={searchPlaceholder}
                                            value={query}
                                            placeholder={searchPlaceholder}
                                            onChange={(event) => setQuery(event.target.value)}
                                            onKeyDown={onListKeyDown}
                                            autoComplete="off"
                                            spellCheck={false}
                                            className="h-9 w-full rounded-lg bg-ink-800 pl-8 pr-3 text-sm text-paper placeholder:text-paper/45 focus:outline-none focus:ring-2 focus:ring-cream-500/25"
                                        />
                                    </div>
                                )}

                                <div
                                    ref={listbox}
                                    id={listboxId}
                                    role="listbox"
                                    aria-multiselectable="true"
                                    tabIndex={withSearch ? undefined : -1}
                                    aria-labelledby={aria["aria-labelledby"]}
                                    aria-activedescendant={withSearch ? undefined : activeId}
                                    onKeyDown={withSearch ? undefined : onListKeyDown}
                                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 focus:outline-none"
                                >
                                    {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-paper/55">{emptyText}</p>}

                                    {items.map((option, index) => {
                                        const picked = values.includes(option.value);
                                        const isBlocked = blocked(option);
                                        const hint = option.hint ?? (full && !picked ? `Up to ${max}` : undefined);
                                        return (
                                            <div
                                                key={option.value}
                                                id={optionId(index)}
                                                role="option"
                                                aria-selected={picked}
                                                aria-disabled={isBlocked || undefined}
                                                onPointerMove={() => !isBlocked && active !== index && setActive(index)}
                                                onClick={() => toggle(option)}
                                                className={cn(
                                                    "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-100 [&_svg]:size-4",
                                                    index === active && !isBlocked && "bg-paper/[0.06]",
                                                    isBlocked ? "cursor-not-allowed opacity-45" : "text-paper/85",
                                                    picked && "text-paper"
                                                )}
                                            >
                                                {option.icon && <span className="shrink-0 text-paper/60">{option.icon}</span>}
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate">{option.label}</span>
                                                    {option.description && <span className="block truncate text-xs text-paper/55">{option.description}</span>}
                                                </span>
                                                {hint && <span className="shrink-0 text-[0.7rem] text-paper/55">{hint}</span>}
                                                <Check className={cn("size-4 shrink-0 text-cream-400", !picked && "invisible")} aria-hidden="true" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </>
    );
}
