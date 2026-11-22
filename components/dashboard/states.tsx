"use client";

import { CircleAlert, LoaderCircle, RefreshCw } from "@/components/ui/glyphs";
import { CookieMark } from "@/components/ui/cookie";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/client";
import { useState } from "react";
import cn from "@/lib/cn";


interface EmptyProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
    compact?: boolean;
}

export function EmptyState({ title, description, icon, action, className, compact }: EmptyProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center rounded-2xl border border-dashed border-paper/12 bg-paper/[0.015] text-center",
                compact ? "px-5 py-8" : "px-6 py-14",
                className
            )}
        >
            {icon ? (
                <span className="icon-chip size-12 rounded-2xl [&_svg]:size-5">
                    {icon}
                </span>
            ) : (
                <CookieMark className={compact ? "size-9" : "size-11"} />
            )}
            <h3 className={cn("font-display text-paper", compact ? "mt-3 text-lg" : "mt-4 text-xl")}>{title}</h3>
            {description && (
                <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-paper/65">{description}</p>
            )}
            {action && <div className={cn("flex flex-wrap justify-center gap-2", compact ? "mt-4" : "mt-5")}>{action}</div>}
        </div>
    );
}


interface ErrorProps {
    error: unknown;
    title?: React.ReactNode;
    onRetry?: () => Promise<unknown> | void;
    className?: string;
    compact?: boolean;
}

export function ErrorState({ error, title = "Couldn't load this", onRetry, className, compact }: ErrorProps) {
    const [retrying, setRetrying] = useState(false);

    const retry = async () => {
        if (!onRetry) return;
        setRetrying(true);
        try {
            await onRetry();
        } catch {
        } finally {
            setRetrying(false);
        }
    };

    return (
        <div
            role="alert"
            className={cn(
                "flex flex-col items-center rounded-2xl border border-bad/15 bg-bad/[0.03] text-center",
                compact ? "px-5 py-7" : "px-6 py-12",
                className
            )}
        >
            <span className="grid size-10 place-items-center rounded-xl border border-bad/20 bg-bad/10 text-[var(--color-bad-300)]">
                <CircleAlert className="size-5" />
            </span>
            <h3 className={cn("font-display text-paper", compact ? "mt-3 text-lg" : "mt-4 text-xl")}>{title}</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-paper/70">{errorMessage(error)}</p>
            {onRetry && (
                <Button variant="secondary" size="sm" className="mt-4" onClick={retry} disabled={retrying}>
                    {retrying ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
                    Try again
                </Button>
            )}
        </div>
    );
}


export function PageHeader({
    title,
    description,
    actions,
    leading,
    meta,
    className
}: {
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    leading?: React.ReactNode;
    meta?: React.ReactNode;
    className?: string;
}) {
    return (
        <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
            <div className="flex min-w-0 items-center gap-3.5">
                {leading}
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="truncate font-display text-[1.75rem] leading-tight tracking-tight text-paper sm:text-[2rem]">{title}</h1>
                        {meta}
                    </div>
                    {description && <p className="mt-0.5 text-sm leading-relaxed text-paper/65 sm:text-sm">{description}</p>}
                </div>
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
    );
}


