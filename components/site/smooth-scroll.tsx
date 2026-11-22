"use client";

import { PENDING_SCROLL_KEY, cancelScrollAnimation, smoothScrollTo } from "@/lib/scroll";
import { usePathname } from "next/navigation";
import { useEffect } from "react";


export function SmoothScroll() {
    const pathname = usePathname();

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            const anchor = (event.target as HTMLElement | null)?.closest?.("a");
            const href = anchor?.getAttribute("href");
            if (!anchor || !href || !href.startsWith("#") || href === "#") return;

            const id = decodeURIComponent(href.slice(1));
            if (!document.getElementById(id)) return;

            event.preventDefault();
            smoothScrollTo(id);
            // Keeps the deep link shareable without letting the browser jump
            history.replaceState(null, "", `#${id}`);
        };

        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    useEffect(() => {
        let pending: string | null = null;
        try {
            pending = sessionStorage.getItem(PENDING_SCROLL_KEY);
            if (pending) sessionStorage.removeItem(PENDING_SCROLL_KEY);
        } catch {
            pending = null;
        }
        if (!pending) return;

        const frame = requestAnimationFrame(() =>
            requestAnimationFrame(() => smoothScrollTo(pending!))
        );
        return () => cancelAnimationFrame(frame);
    }, [pathname]);

    return null;
}
