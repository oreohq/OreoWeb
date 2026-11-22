"use client";

import { useLayoutEffect, useState } from "react";


interface Options {
    align?: "start" | "end" | "center";
    prefer?: "below" | "above";
    offset?: number;
    matchWidth?: boolean;
    minWidth?: number;
    height?: number;
}

export interface FloatingStyle {
    style: React.CSSProperties;
    side: "below" | "above";
}

const MARGIN = 8;


export function useFloating(trigger: React.RefObject<HTMLElement | null>, open: boolean, options: Options = {}): FloatingStyle {
    const { align = "start", prefer = "below", offset = 6, matchWidth = false, minWidth = 0, height = 320 } = options;
    const [state, setState] = useState<FloatingStyle>({ style: { position: "fixed", top: -9999, left: -9999 }, side: "below" });

    useLayoutEffect(() => {
        if (!open) return;

        const update = () => {
            const node = trigger.current;
            if (!node) return;
            const rect = node.getBoundingClientRect();
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = window.innerHeight;

            const below = viewportHeight - rect.bottom - offset - MARGIN;
            const above = rect.top - offset - MARGIN;
            const side: "below" | "above" =
                prefer === "above"
                    ? above >= Math.min(height, 60) || above > below ? "above" : "below"
                    : below >= Math.min(height, 240) || below >= above ? "below" : "above";

            const width = Math.min(Math.max(matchWidth ? rect.width : 0, minWidth), viewportWidth - MARGIN * 2);
            let left =
                align === "end" ? rect.right - width : align === "center" ? rect.left + rect.width / 2 - width / 2 : rect.left;
            left = Math.max(MARGIN, Math.min(left, viewportWidth - width - MARGIN));

            const style: React.CSSProperties = {
                position: "fixed",
                left,
                width: width || undefined,
                maxHeight: Math.max(120, side === "below" ? below : above),
                ...(side === "below"
                    ? { top: rect.bottom + offset }
                    : { bottom: viewportHeight - rect.top + offset })
            };
            setState({ style, side });
        };

        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [open, trigger, align, prefer, offset, matchWidth, minWidth, height]);

    return state;
}
