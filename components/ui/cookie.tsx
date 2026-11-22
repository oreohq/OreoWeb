import cn from "@/lib/cn";


/** An <img> rather than inline SVG, so its mask ids never clash and it caches once */
export function CookieMark({ className }: { className?: string }) {
    return (
        <img src="/Icon.svg" alt="" aria-hidden="true" draggable={false} className={cn("shrink-0 select-none object-contain", className)} />
    );
}


export function CreamSeam({ className }: { className?: string }) {
    return <div className={cn("seam h-px w-full", className)} aria-hidden="true" />;
}
