"use client";

import { CharCount, Field, inputClasses } from "@/components/ui/field";
import type { Placeholder } from "@/lib/dashboard/placeholders";
import { useId, useRef, useState } from "react";
import { Braces } from "@/components/ui/glyphs";
import cn from "@/lib/cn";


interface Props {
    label: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    placeholders: Placeholder[];
    max: number;
    multiline?: boolean;
    rows?: number;
    placeholder?: string;
    description?: React.ReactNode;
    error?: React.ReactNode;
    chips?: "always" | "focus";
    aside?: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

export function TemplateField({
    label,
    value,
    onChange,
    placeholders,
    max,
    multiline,
    rows = 4,
    placeholder,
    description,
    error,
    chips = "focus",
    aside,
    disabled,
    className
}: Props) {
    const id = useId();
    const countId = useId();
    const chipsId = useId();
    const errorId = useId();
    const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
    const touched = useRef(false);
    const [focused, setFocused] = useState(false);

    const insert = (token: string) => {
        const node = field.current;
        const start = node && touched.current ? node.selectionStart ?? value.length : value.length;
        const end = node && touched.current ? node.selectionEnd ?? value.length : value.length;
        const next = `${value.slice(0, start)}${token}${value.slice(end)}`;
        onChange(next);
        requestAnimationFrame(() => {
            if (!node) return;
            node.focus();
            const caret = start + token.length;
            node.setSelectionRange(caret, caret);
            touched.current = true;
        });
    };

    const over = value.length > max;
    const showChips = chips === "always" || focused;
    const groups = [...new Set(placeholders.map((item) => item.group))];
    const describedBy = [countId, over || error ? errorId : null].filter(Boolean).join(" ");

    const common = {
        ref: field,
        id,
        value,
        disabled,
        placeholder,
        maxLength: max * 2,
        spellCheck: true,
        "aria-invalid": over || Boolean(error) || undefined,
        "aria-describedby": describedBy,
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
        onSelect: () => (touched.current = true),
        onKeyUp: () => (touched.current = true)
    };

    return (
        <div
            className={className}
            onFocus={() => setFocused(true)}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
            }}
        >
            <Field
                label={label}
                htmlFor={id}
                description={description}
                error={over ? `Keep it under ${max.toLocaleString()} characters.` : error}
                errorId={errorId}
                aside={
                    <span className="flex items-center gap-3">
                        {aside}
                        <CharCount value={value.length} max={max} id={countId} />
                    </span>
                }
            >
                {multiline ? (
                    <textarea {...common} rows={rows} className={cn(inputClasses, "block min-h-24 resize-y py-3 font-mono text-[0.85rem] leading-relaxed")} />
                ) : (
                    <input {...common} type="text" className={cn(inputClasses, "h-11 font-mono text-[0.85rem]")} />
                )}

                {showChips && placeholders.length > 0 && (
                    <div id={chipsId} className={cn("mt-2.5 space-y-1.5", chips === "focus" && "popover-in")} role="group" aria-label="Insert a placeholder">
                        {groups.map((group) => (
                            <div key={group} className="flex flex-wrap items-center gap-1.5">
                                <span className="mr-0.5 flex w-[4.5rem] shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-paper/55">
                                    {group === groups[0] && <Braces className="size-3" aria-hidden="true" />}
                                    {group}
                                </span>
                                {placeholders
                                    .filter((item) => item.group === group)
                                    .map((item) => (
                                        <button
                                            key={item.token}
                                            type="button"
                                            disabled={disabled}
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => insert(item.token)}
                                            title={item.description}
                                            aria-label={`Insert ${item.token}: ${item.description}`}
                                            className="rounded-lg border border-paper/10 bg-ink-800 px-2 py-1 font-mono text-[0.72rem] text-cream-300/85 transition-colors hover:border-cream-400/30 hover:bg-cream-500/10 hover:text-cream-200 disabled:opacity-40"
                                        >
                                            {item.token}
                                        </button>
                                    ))}
                            </div>
                        ))}
                    </div>
                )}
            </Field>
        </div>
    );
}
