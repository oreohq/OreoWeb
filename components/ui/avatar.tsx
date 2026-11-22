"use client";

import { useEffect, useRef, useState } from "react";
import { safeUrl } from "@/lib/safe-url";
import cn from "@/lib/cn";


function initialsOf(name: string, max = 4) {
    const acronym = name
        .replace(/'s /g, " ")
        .replace(/\w+/g, (word) => word[0] ?? "")
        .replace(/\s/g, "");
    return (acronym || name.trim()[0] || "?").slice(0, max);
}


interface Props {
    src: string | null | undefined;
    name: string;
    className?: string;
    shape?: "circle" | "rounded";
    decorative?: boolean;
    eager?: boolean;
}

export function Avatar({ src: raw, name, className, shape = "circle", decorative = true, eager = false }: Props) {
    const src = safeUrl(raw);
    const [failed, setFailed] = useState(false);
    const image = useRef<HTMLImageElement>(null);
    // A server-rendered image can fail before hydration, when React isn't listening for onError yet
    useEffect(() => {
        const node = image.current;
        setFailed(Boolean(node?.complete && node.naturalWidth === 0));
    }, [src]);

    const rounding = shape === "circle" ? "rounded-full" : "rounded-[26%]";

    if (!src || failed) {
        return (
            <span
                role={decorative ? undefined : "img"}
                aria-label={decorative ? undefined : name}
                aria-hidden={decorative || undefined}
                className={cn(
                    "grid size-10 shrink-0 select-none place-items-center overflow-hidden bg-ink-700 font-medium text-paper/80",
                    rounding,
                    className
                )}
            >
                <span className="truncate px-0.5 leading-none">{initialsOf(name)}</span>
            </span>
        );
    }

    return (
        <img
            ref={image}
            src={src}
            alt={decorative ? "" : name}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            draggable={false}
            onError={() => setFailed(true)}
            className={cn("size-10 shrink-0 bg-ink-700 object-cover", rounding, className)}
        />
    );
}
