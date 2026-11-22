"use client";

import { useEffect, useRef, useState } from "react";
import cn from "@/lib/cn";


type Hsv = { h: number, s: number, v: number };

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function hexToHsv(hex: string): Hsv {
    const n = parseInt(hex.slice(1), 16);
    const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
    let h = 0;
    if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

function hsvToHex({ h, s, v }: Hsv): string {
    const f = (n: number) => {
        const k = (n + h / 60) % 6;
        return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
    };
    return `#${[f(5), f(3), f(1)].map((c) => c.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}


function useDrag(onMove: (x: number, y: number) => void) {
    const ref = useRef<HTMLDivElement>(null);
    const move = useRef(onMove);
    move.current = onMove;

    const onPointerDown = (event: React.PointerEvent) => {
        const el = ref.current;
        if (!el) return;
        el.setPointerCapture(event.pointerId);
        const report = (e: { clientX: number, clientY: number }) => {
            const rect = el.getBoundingClientRect();
            move.current(clamp((e.clientX - rect.left) / rect.width), clamp((e.clientY - rect.top) / rect.height));
        };
        report(event);
        const onMoveEvent = (e: PointerEvent) => report(e);
        const stop = () => {
            el.removeEventListener("pointermove", onMoveEvent);
            el.removeEventListener("pointerup", stop);
            el.removeEventListener("pointercancel", stop);
        };
        el.addEventListener("pointermove", onMoveEvent);
        el.addEventListener("pointerup", stop);
        el.addEventListener("pointercancel", stop);
    };

    return { ref, onPointerDown };
}


export function HsvPicker({ value, onChange }: { value: string, onChange: (hex: string) => void }) {
    // Hue is kept separately so it survives greys and black, where the hex has none
    const [hsv, setHsv] = useState(() => hexToHsv(value));
    const [text, setText] = useState(value);
    useEffect(() => {
        if (hsvToHex(hsv) !== value.toUpperCase()) {
            const next = hexToHsv(value);
            setHsv((current) => (next.s ? next : { ...next, h: current.h }));
        }
        setText(value.toUpperCase());
    }, [value]);

    const update = (next: Hsv) => {
        setHsv(next);
        onChange(hsvToHex(next));
    };

    const square = useDrag((x, y) => update({ ...hsv, s: x, v: 1 - y }));
    const hue = useDrag((x) => update({ ...hsv, h: x * 360 }));

    const squareKeys = (event: React.KeyboardEvent) => {
        const step = event.shiftKey ? 0.1 : 0.02;
        const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault();
        update({ ...hsv, s: clamp(hsv.s + move[0]), v: clamp(hsv.v + move[1]) });
    };
    const hueKeys = (event: React.KeyboardEvent) => {
        const step = event.shiftKey ? 15 : 3;
        const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? step : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -step : 0;
        if (!delta) return;
        event.preventDefault();
        update({ ...hsv, h: (hsv.h + delta + 360) % 360 });
    };

    const commitText = (raw: string) => {
        const hex = (raw.startsWith("#") ? raw : `#${raw}`).toUpperCase();
        if (/^#[0-9A-F]{6}$/.test(hex)) {
            setHsv(hexToHsv(hex));
            onChange(hex);
        } else {
            setText(value.toUpperCase());
        }
    };

    const pure = hsvToHex({ h: hsv.h, s: 1, v: 1 });

    return (
        <div className="w-full space-y-3">
            <div
                ref={square.ref}
                onPointerDown={square.onPointerDown}
                onKeyDown={squareKeys}
                role="slider"
                tabIndex={0}
                aria-label="Saturation and brightness"
                aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
                className="relative h-40 w-full cursor-crosshair touch-none rounded-xl outline-none ring-cream-500 focus-visible:ring-2"
                style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pure})` }}
            >
                <span
                    className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_2px_6px_rgb(0_0_0/0.5)]"
                    style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hsvToHex(hsv) }}
                />
            </div>

            <div
                ref={hue.ref}
                onPointerDown={hue.onPointerDown}
                onKeyDown={hueKeys}
                role="slider"
                tabIndex={0}
                aria-label="Hue"
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={Math.round(hsv.h)}
                className="relative h-3.5 w-full cursor-pointer touch-none rounded-full outline-none ring-cream-500 focus-visible:ring-2"
                style={{ background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
            >
                <span
                    className="pointer-events-none absolute top-1/2 size-[1.125rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_2px_6px_rgb(0_0_0/0.5)]"
                    style={{ left: `${(hsv.h / 360) * 100}%`, background: pure }}
                />
            </div>

            <div className="flex items-center gap-2">
                <span className="size-9 shrink-0 rounded-[0.625rem] ring-1 ring-inset ring-paper/15" style={{ background: hsvToHex(hsv) }} aria-hidden="true" />
                <input
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onBlur={(event) => commitText(event.target.value.trim())}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            commitText(event.currentTarget.value.trim());
                        }
                    }}
                    maxLength={7}
                    spellCheck={false}
                    aria-label="Hex colour"
                    className={cn(
                        "h-9 w-full rounded-[0.625rem] border border-paper/10 bg-ink-900 px-3 font-mono text-sm uppercase text-paper",
                        "focus:border-cream-400/60 focus:outline-none focus:ring-[3px] focus:ring-cream-500/15"
                    )}
                />
            </div>
        </div>
    );
}
