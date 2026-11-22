"use client";

import { spring } from "@/lib/motion";
import { m } from "motion/react";
import { useId } from "react";
import cn from "@/lib/cn";


interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    size?: "sm" | "md";
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    className?: string;
}

export function Switch({ checked, onChange, disabled, id, size = "md", className, ...aria }: SwitchProps) {
    const md = size === "md";
    return (
        <button
            type="button"
            role="switch"
            id={id}
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                "group relative flex shrink-0 items-center rounded-full p-[3px] transition-colors duration-200 ease-snappy disabled:cursor-not-allowed disabled:opacity-45",
                md ? "h-6 w-[2.625rem]" : "h-5 w-9",
                checked ? "justify-end bg-cream-500" : "justify-start bg-ink-600 hover:bg-ink-500",
                className
            )}
            {...aria}
        >
            <m.span
                layout
                transition={spring.snappy}
                aria-hidden="true"
                className={cn(
                    "block rounded-full shadow-[0_1px_3px_rgb(0_0_0/0.35)]",
                    md ? "size-[1.125rem]" : "size-3.5",
                    checked ? "bg-[var(--color-cream-900)]" : "bg-paper/85"
                )}
            />
        </button>
    );
}


interface SwitchFieldProps extends Omit<SwitchProps, "aria-labelledby" | "aria-describedby" | "aria-label"> {
    label: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

export function SwitchField({ label, description, icon, children, className, ...props }: SwitchFieldProps) {
    const labelId = useId();
    const descriptionId = useId();

    return (
        <div className={cn("flex items-start gap-3", className)}>
            {icon && (
                <span
                    className={cn(
                        "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border transition-colors duration-200 [&_svg]:size-4",
                        props.checked && !props.disabled
                            ? "border-cream-400/20 bg-cream-500/10 text-cream-400"
                            : "border-paper/8 bg-ink-800 text-paper/55"
                    )}
                    aria-hidden="true"
                >
                    {icon}
                </span>
            )}
            <div className="min-w-0 flex-1">
                <span
                    id={labelId}
                    onClick={() => !props.disabled && props.onChange(!props.checked)}
                    className={cn(
                        "block text-sm font-medium text-paper",
                        props.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    )}
                >
                    {label}
                </span>
                {description && (
                    <span id={descriptionId} className="mt-0.5 block text-sm leading-relaxed text-paper/65">
                        {description}
                    </span>
                )}
                {children}
            </div>
            <Switch
                {...props}
                aria-labelledby={labelId}
                aria-describedby={description ? descriptionId : undefined}
                className="mt-0.5"
            />
        </div>
    );
}
