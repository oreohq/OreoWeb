"use client";

import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";


interface Props {
    src: string;
    mobileSrc: string;
    alt: string;
}

export function ImageModal({ src, mobileSrc, alt }: Props) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <>
            <span className="my-5 block">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label={`Expand screenshot: ${alt}`}
                    className="window-frame group block w-full overflow-hidden rounded-2xl p-1.5 text-left shadow-xl shadow-black/40 transition-colors duration-300 hover:border-cream-300/25"
                >
                    <span className="flex items-center gap-2 px-2 pb-2 pt-1">
                        <span className="flex gap-1.5" aria-hidden="true">
                            <span className="size-2 rounded-full bg-[#ff5f57]" />
                            <span className="size-2 rounded-full bg-[#febc2e]" />
                            <span className="size-2 rounded-full bg-[#28c840]" />
                        </span>
                        <span className="ml-1 truncate text-[0.7rem] font-medium text-cream-100/35">
                            {alt || "screenshot"}
                        </span>
                        <span className="ml-auto grid size-6 shrink-0 place-items-center rounded-md text-cream-100/30 transition-colors group-hover:bg-cream-100/8 group-hover:text-cream-100/80">
                            <Maximize2 className="size-3" />
                        </span>
                    </span>

                    <span className="block overflow-hidden rounded-xl bg-cocoa-950">
                        <picture>
                            <source media="(max-width: 640px)" srcSet={mobileSrc} />
                            <img
                                src={src}
                                alt={alt}
                                loading="lazy"
                                className="w-full transition-transform duration-500 group-hover:scale-[1.015]"
                            />
                        </picture>
                    </span>
                </button>
            </span>

            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={alt}
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-cocoa-950/92 p-4 backdrop-blur-md"
                >
                    <button
                        type="button"
                        aria-label="Close screenshot"
                        className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl border border-cream-200/12 bg-cocoa-800/80 text-cream-100 transition-colors hover:bg-cocoa-700"
                    >
                        <X className="size-5" />
                    </button>

                    <img
                        src={src}
                        alt={alt}
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-[88svh] max-w-full rounded-2xl border border-cream-200/10 object-contain shadow-2xl"
                    />
                </div>
            )}
        </>
    );
}
