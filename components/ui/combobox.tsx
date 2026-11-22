"use client";

import { Check, ChevronsUpDown, Search, TriangleAlert } from "@/components/ui/glyphs";
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { useFloating } from "@/components/ui/floating";
import { inputClasses } from "@/components/ui/field";
import { AnimatePresence, m } from "motion/react";
import { useLayer } from "@/components/ui/layers";
import { createPortal } from "react-dom";
import { popover } from "@/lib/motion";
import cn from "@/lib/cn";


export interface ComboOption<V extends string = string> {
    value: V;
    label: string;
    icon?: React.ReactNode;
    description?: React.ReactNode;
    group?: string;
    disabled?: boolean;
    hint?: React.ReactNode;
    warn?: boolean;
    keywords?: string;
}

interface Props<V extends string> {
    id?: string;
    value: V | null;
    onChange: (value: V | null) => void;
    options: ComboOption<V>[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    clearOption?: { label: string, icon?: React.ReactNode, description?: React.ReactNode };
    missingLabel?: React.ReactNode;
    disabled?: boolean;
    invalid?: boolean;
    searchable?: boolean;
    className?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
}

const CLEAR = "__clear__";

type Item<V extends string> = ComboOption<V> | { value: typeof CLEAR, label: string, icon?: React.ReactNode, description?: React.ReactNode, disabled?: false, group?: undefined, hint?: undefined, warn?: undefined, keywords?: undefined };


export function Combobox<V extends string>({
    id,
    value,
    onChange,
    options,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    emptyText = "Nothing matches that.",
    clearOption,
    missingLabel,
    disabled,
    invalid,
    searchable,
    className,
    ...aria
}: Props<V>) {
    const autoId = useId();
    const triggerId = id ?? `${autoId}-trigger`;
    const listboxId = `${autoId}-listbox`;
    const optionId = (index: number) => `${autoId}-option-${index}`;

    const trigger = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const search = useRef<HTMLInputElement>(null);
    const listbox = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(-1);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const withSearch = searchable ?? options.length > 7;
    const selected = options.find((option) => option.value === value) ?? null;

    const items = useMemo<Item<V>[]>(() => {
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        const matches = options.filter((option) => {
            if (!words.length) return true;
            const haystack = `${option.label} ${option.group ?? ""} ${option.keywords ?? ""}`.toLowerCase();
            return words.every((word) => haystack.includes(word));
        });
        return clearOption && !words.length
            ? [{ value: CLEAR, label: clearOption.label, icon: clearOption.icon, description: clearOption.description }, ...matches]
            : matches;
    }, [options, query, clearOption]);

    const floating = useFloating(trigger, open, { matchWidth: true, minWidth: 260, height: 340 });

    const firstEnabled = (from: number, step: 1 | -1) => {
        for (let index = from; index >= 0 && index < items.length; index += step) {
            if (!items[index]!.disabled) return index;
        }
        return -1;
    };

    const openList = (initialQuery = "") => {
        if (disabled) return;
        setQuery(initialQuery);
        setOpen(true);
    };

    const close = (refocus = true) => {
        setOpen(false);
        setQuery("");
        if (refocus) trigger.current?.focus({ preventScroll: true });
    };

    const choose = (item: Item<V> | undefined) => {
        if (!item || item.disabled) return;
        onChange(item.value === CLEAR ? null : (item.value as V));
        close();
    };

    // Only when the list opens or the search changes, otherwise arrow keys would keep snapping back
    useEffect(() => {
        if (!open) return;
        const current = items.findIndex((item) => (item.value === CLEAR ? value === null : item.value === value));
        setActive(query ? firstEnabled(0, 1) : current >= 0 && !items[current]!.disabled ? current : firstEnabled(0, 1));
    }, [open, query]);

    useEffect(() => {
        if (open && active >= items.length) setActive(firstEnabled(0, 1));
    }, [items.length]);

    useEffect(() => {
        if (!open || withSearch) return;
        const frame = requestAnimationFrame(() => listbox.current?.focus({ preventScroll: true }));
        return () => cancelAnimationFrame(frame);
    }, [open, withSearch]);

    useEffect(() => {
        if (!open || active < 0) return;
        document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
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
                const next = firstEnabled(active + 1, 1);
                setActive(next === -1 ? firstEnabled(0, 1) : next);
                break;
            }
            case "ArrowUp": {
                event.preventDefault();
                const previous = firstEnabled(active - 1, -1);
                setActive(previous === -1 ? firstEnabled(items.length - 1, -1) : previous);
                break;
            }
            case "Home":
                if (withSearch && query) return;
                event.preventDefault();
                setActive(firstEnabled(0, 1));
                break;
            case "End":
                if (withSearch && query) return;
                event.preventDefault();
                setActive(firstEnabled(items.length - 1, -1));
                break;
            case "Enter":
                event.preventDefault();
                choose(items[active]);
                break;
            case "Tab":
                event.preventDefault();
                close();
                break;
        }
    };

    const onTriggerKeyDown = (event: React.KeyboardEvent) => {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
            event.preventDefault();
            openList();
        } else if (withSearch && event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault();
            openList(event.key);
        }
    };

    const activeId = active >= 0 ? optionId(active) : undefined;
    const triggerWarn = Boolean(selected?.warn) || (value !== null && !selected && Boolean(missingLabel));

    return (
        <>
            <button
                ref={trigger}
                id={triggerId}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listboxId : undefined}
                aria-invalid={invalid || undefined}
                disabled={disabled}
                onClick={() => (open ? close() : openList())}
                onKeyDown={onTriggerKeyDown}
                className={cn(
                    inputClasses,
                    "flex h-10 items-center gap-2.5 text-left [&_svg]:size-4",
                    open && "border-cream-400/60 ring-[3px] ring-cream-500/15",
                    triggerWarn && "border-warn/35",
                    className
                )}
                {...aria}
            >
                {selected ? (
                    <>
                        {selected.icon && <span className="shrink-0 text-paper/65">{selected.icon}</span>}
                        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
                        {selected.warn && <TriangleAlert className="size-4 shrink-0 text-warn" aria-label="Warning" />}
                    </>
                ) : value !== null && missingLabel ? (
                    <>
                        <TriangleAlert className="size-4 shrink-0 text-warn" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-warn/90">{missingLabel}</span>
                    </>
                ) : value === null && clearOption ? (
                    <>
                        {clearOption.icon && <span className="shrink-0 text-paper/55">{clearOption.icon}</span>}
                        <span className="min-w-0 flex-1 truncate text-paper/70">{clearOption.label}</span>
                    </>
                ) : (
                    <span className="min-w-0 flex-1 truncate text-paper/45">{placeholder}</span>
                )}
                <ChevronsUpDown className="size-4 shrink-0 text-paper/50" aria-hidden="true" />
            </button>

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
                                    ref={search}
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
                            tabIndex={withSearch ? undefined : -1}
                            aria-labelledby={aria["aria-labelledby"]}
                            aria-activedescendant={withSearch ? undefined : activeId}
                            onKeyDown={withSearch ? undefined : onListKeyDown}
                            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 focus:outline-none"
                        >
                            {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-paper/55">{emptyText}</p>}

                            {items.map((item, index) => {
                                const header = item.group && item.group !== items[index - 1]?.group ? item.group : null;
                                const isSelected = item.value === CLEAR ? value === null : item.value === value;
                                return (
                                    <Fragment key={`${item.group ?? ""}:${item.value}`}>
                                        {header && (
                                            <div
                                                className="truncate px-2.5 pb-1 pt-2.5 text-xs font-medium text-paper/55 first:pt-1"
                                                aria-hidden="true"
                                            >
                                                {header}
                                            </div>
                                        )}
                                        <div
                                            id={optionId(index)}
                                            role="option"
                                            aria-selected={isSelected}
                                            aria-disabled={item.disabled || undefined}
                                            onPointerMove={() => !item.disabled && active !== index && setActive(index)}
                                            onClick={() => choose(item)}
                                            className={cn(
                                                "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-100 [&_svg]:size-4",
                                                index === active && !item.disabled && "bg-paper/[0.06]",
                                                item.disabled ? "cursor-not-allowed opacity-45" : "text-paper/85",
                                                isSelected && "text-paper"
                                            )}
                                        >
                                            {item.icon && <span className="shrink-0 text-paper/60">{item.icon}</span>}
                                            <span className="min-w-0 flex-1">
                                                <span className={cn("block truncate", item.value === CLEAR && "text-paper/75")}>
                                                    {item.label}
                                                </span>
                                                {item.description && (
                                                    <span className="block truncate text-xs text-paper/55">{item.description}</span>
                                                )}
                                            </span>
                                            {item.hint && (
                                                <span
                                                    className={cn(
                                                        "flex shrink-0 items-center gap-1 text-[0.7rem]",
                                                        item.warn ? "text-warn" : "text-paper/55"
                                                    )}
                                                >
                                                    {item.warn && <TriangleAlert className="!size-3.5" aria-hidden="true" />}
                                                    {item.hint}
                                                </span>
                                            )}
                                            <Check
                                                className={cn("size-4 shrink-0 text-cream-400", !isSelected && "invisible")}
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </Fragment>
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
