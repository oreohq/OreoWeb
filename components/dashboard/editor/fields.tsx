"use client";

import { Check, Film, ImageOff, Link2, Lock, Pipette, Radio, Smartphone, UserRound, Video } from "@/components/ui/glyphs";
import { CONTENT_TYPE_NAMES, platformColor, platformName } from "@/lib/dashboard/platforms";
import { imageFieldError } from "@/components/dashboard/editor/model";
import type { ContentType, PlatformName } from "@/lib/api/types";
import { Field, inputClasses } from "@/components/ui/field";
import { HsvPicker } from "@/components/ui/hsv-picker";
import { Segmented } from "@/components/ui/segmented";
import { useEffect, useId, useState } from "react";
import { Popover } from "@/components/ui/popover";
import { AnimatePresence, m } from "motion/react";
import { spring } from "@/lib/motion";
import cn from "@/lib/cn";


export function SectionCard({
    id,
    icon,
    title,
    description,
    aside,
    children,
    tone = "default"
}: {
    id: string;
    icon: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    aside?: React.ReactNode;
    children: React.ReactNode;
    tone?: "default" | "danger";
}) {
    return (
        <section
            id={id}
            aria-labelledby={`${id}-title`}
            className={cn(
                "scroll-mt-24 rounded-2xl border p-4 sm:p-5",
                tone === "danger" ? "border-bad/15 bg-bad/[0.03]" : "panel"
            )}
        >
            <header className="flex items-start gap-3">
                <span
                    className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg border [&_svg]:size-4",
                        tone === "danger" ? "border-bad/20 bg-bad/10 text-[var(--color-bad-300)]" : "icon-chip border-transparent"
                    )}
                    aria-hidden="true"
                >
                    {icon}
                </span>
                <div className="min-w-0 flex-1 pt-px">
                    <h2 id={`${id}-title`} className="font-display text-lg leading-tight text-paper">{title}</h2>
                    {description && <p className="mt-0.5 text-sm leading-relaxed text-paper/65">{description}</p>}
                </div>
                {aside && <div className="shrink-0">{aside}</div>}
            </header>
            <div className="mt-5 space-y-5">{children}</div>
        </section>
    );
}


const CONTENT_ICONS: Record<ContentType, React.ReactNode> = {
    live: <Radio className="size-4" />,
    video: <Video className="size-4" />,
    premiere: <Film className="size-4" />,
    shorts: <Smartphone className="size-4" />,
    members: <Lock className="size-4" />
};

export function contentIcon(type: ContentType, className = "size-4") {
    const Icon = { live: Radio, video: Video, premiere: Film, shorts: Smartphone, members: Lock }[type];
    return <Icon className={className} />;
}

export function ContentTypePicker({
    value,
    onChange,
    options,
    labelledBy,
    error
}: {
    value: ContentType[];
    onChange: (value: ContentType[]) => void;
    options: readonly ContentType[];
    labelledBy: string;
    error?: string;
}) {
    return (
        <div role="group" aria-labelledby={labelledBy} className={cn("grid grid-cols-2 gap-2", options.length > 4 ? "sm:grid-cols-3" : "sm:grid-cols-4")}>
            {options.map((type) => {
                const checked = value.includes(type);
                const last = checked && value.length === 1;
                return (
                    <button
                        key={type}
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        aria-disabled={last || undefined}
                        title={last ? "At least one kind of post has to stay on" : undefined}
                        onClick={() => {
                            if (last) return;
                            onChange(checked ? value.filter((item) => item !== type) : [...value, type]);
                        }}
                        className={cn(
                            "relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                            checked ? "border-cream-400/35 bg-cream-500/[0.07] text-paper" : "border-paper/8 bg-ink-900 text-paper/65 hover:border-paper/16 hover:text-paper/80",
                            last && "cursor-not-allowed"
                        )}
                    >
                        <span className={cn(checked ? "text-cream-400" : "text-paper/50")}>{CONTENT_ICONS[type]}</span>
                        {CONTENT_TYPE_NAMES[type].many}
                        <span
                            className={cn(
                                "ml-auto grid size-4.5 shrink-0 place-items-center rounded-md border transition-colors",
                                checked ? "border-cream-400 bg-cream-500 text-[var(--color-cream-900)]" : "border-paper/20"
                            )}
                            aria-hidden="true"
                        >
                            <AnimatePresence initial={false}>
                                {checked && (
                                    <m.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={spring.snappy}>
                                        <Check className="size-3" strokeWidth={3} />
                                    </m.span>
                                )}
                            </AnimatePresence>
                        </span>
                    </button>
                );
            })}
            {error && <p className="col-span-full text-[0.8rem] text-[var(--color-bad-300)]" role="alert">{error}</p>}
        </div>
    );
}


const SWATCHES = [
    { value: "#FFA277", name: "Oreo cream" },
    { value: "#FF0033", name: "YouTube red" },
    { value: "#9146FF", name: "Twitch purple" },
    { value: "#53FC18", name: "Kick green" },
    { value: "#5865F2", name: "Blurple" },
    { value: "#57F287", name: "Green" },
    { value: "#FEE75C", name: "Yellow" },
    { value: "#EB459E", name: "Fuchsia" },
    { value: "#ED4245", name: "Red" },
    { value: "#FFFFFF", name: "White" },
    { value: "#23272A", name: "Dark" }
];

export function ColorPicker({
    value,
    onChange,
    platform,
    labelledBy,
    error
}: {
    value: string | null;
    onChange: (value: string | null) => void;
    platform: PlatformName;
    labelledBy: string;
    error?: string;
}) {
    const hexId = useId();
    const [text, setText] = useState(value ?? "");
    useEffect(() => setText(value ?? ""), [value]);

    const brand = platformColor(platform).toUpperCase();
    const options = [
        { value: null, name: `${platformName(platform)} colour (default)`, color: brand },
        ...SWATCHES.filter((swatch) => swatch.value !== brand).map((swatch) => ({ value: swatch.value, name: swatch.name, color: swatch.value }))
    ];
    const current = value?.toUpperCase() ?? null;
    const custom = current !== null && !options.some((option) => option.value === current);

    const onKey = (event: React.KeyboardEvent, index: number) => {
        const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        const next = (index + step + options.length) % options.length;
        onChange(options[next]!.value);
        (event.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
    };

    return (
        <div className="space-y-3">
            <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap items-center gap-2">
                {options.map((option, index) => {
                    const checked = option.value === current;
                    return (
                        <button
                            key={option.value ?? "platform"}
                            type="button"
                            role="radio"
                            aria-checked={checked}
                            aria-label={option.name}
                            title={option.name}
                            tabIndex={checked || (current === null && index === 0) || (custom && index === 0) ? 0 : -1}
                            onClick={() => onChange(option.value)}
                            onKeyDown={(event) => onKey(event, index)}
                            className={cn(
                                "relative grid size-9 place-items-center rounded-xl border-2 transition-transform duration-150 hover:scale-105",
                                checked ? "border-paper" : "border-transparent"
                            )}
                            style={{ background: option.color }}
                        >
                            {option.value === null && (
                                <span className="absolute -right-1 -top-1 rounded-md bg-ink-950 px-1 text-[0.55rem] font-bold uppercase text-paper">auto</span>
                            )}
                            {checked && (
                                <Check
                                    className={cn("size-4 drop-shadow", ["#FFFFFF", "#FEE75C", "#57F287", "var(--color-cream-500)", "#53FC18"].includes(option.color) ? "text-[var(--color-cream-900)]" : "text-white")}
                                    strokeWidth={3}
                                />
                            )}
                        </button>
                    );
                })}

                <Popover
                    label="Pick any colour"
                    align="start"
                    width={264}
                    trigger={(props, open) => (
                        <button
                            {...props}
                            type="button"
                            title="Pick any colour"
                            aria-label="Pick any colour"
                            className={cn(
                                "relative grid size-9 place-items-center overflow-hidden rounded-xl border-2 bg-[conic-gradient(from_0deg,#ff5f57,#febc2e,#28c840,#5865F2,#EB459E,#ff5f57)] transition-transform hover:scale-105",
                                custom || open ? "border-paper" : "border-transparent"
                            )}
                        >
                            {custom ? (
                                <span className="absolute inset-[3px] rounded-lg" style={{ background: current! }} />
                            ) : null}
                            <Pipette className="relative size-4 text-white drop-shadow" aria-hidden="true" />
                        </button>
                    )}
                >
                    {() => (
                        <div className="p-3">
                            <HsvPicker value={current ?? brand} onChange={(hex) => onChange(hex)} />
                        </div>
                    )}
                </Popover>
            </div>

            <div className="flex items-center gap-2">
                <span className="size-11 shrink-0 rounded-xl border border-paper/10" style={{ background: current ?? brand }} aria-hidden="true" />
                <label htmlFor={hexId} className="sr-only">Hex colour</label>
                <input
                    id={hexId}
                    type="text"
                    value={text}
                    placeholder={`${brand} (${platformName(platform)})`}
                    maxLength={7}
                    spellCheck={false}
                    autoComplete="off"
                    aria-invalid={Boolean(error) || undefined}
                    onChange={(event) => {
                        const raw = event.target.value.trim();
                        const next = raw && !raw.startsWith("#") ? `#${raw}` : raw;
                        setText(next);
                        if (!next) onChange(null);
                        else if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next.toUpperCase());
                        else onChange(next);
                    }}
                    className={cn(inputClasses, "h-11 max-w-52 font-mono text-sm uppercase placeholder:normal-case")}
                />
                {current !== null && (
                    <button type="button" onClick={() => onChange(null)} className="text-sm font-medium text-paper/65 hover:text-paper">
                        Use {platformName(platform)} colour
                    </button>
                )}
            </div>
            {error && <p className="text-[0.8rem] text-[var(--color-bad-300)]" role="alert">{error}</p>}
        </div>
    );
}


type ImageMode = "none" | "avatar" | "thumbnail" | "custom";

const modeOf = (value: string): ImageMode =>
    !value.trim() ? "none" : value.trim() === "{channel.avatar}" ? "avatar" : value.trim() === "{video.thumbnail}" ? "thumbnail" : "custom";

export function ImageField({
    label,
    value,
    onChange,
    description
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    description?: React.ReactNode;
}) {
    const labelId = useId();
    const urlId = useId();
    const [mode, setMode] = useState<ImageMode>(modeOf(value));
    const [url, setUrl] = useState(modeOf(value) === "custom" ? value : "");

    useEffect(() => {
        const next = modeOf(value);
        if (next === "custom") {
            setMode("custom");
            setUrl(value);
            return;
        }
        if (mode === "custom" && !url.trim()) return;
        setMode(next);
    }, [value]);

    const pick = (next: ImageMode) => {
        setMode(next);
        if (next === "none") onChange("");
        else if (next === "avatar") onChange("{channel.avatar}");
        else if (next === "thumbnail") onChange("{video.thumbnail}");
        else if (url.trim()) onChange(url);
    };

    const error = mode === "custom" && url.trim() ? imageFieldError(url) : null;

    return (
        <Field label={label} labelId={labelId} description={description}>
            <Segmented
                labelledBy={labelId}
                value={mode}
                onChange={pick}
                size="sm"
                fill
                className="max-w-md"
                options={[
                    { value: "none", label: "None", icon: <ImageOff className="size-3.5" /> },
                    { value: "avatar", label: "Avatar", icon: <UserRound className="size-3.5" /> },
                    { value: "thumbnail", label: "Thumbnail", icon: <Video className="size-3.5" /> },
                    { value: "custom", label: "Link", icon: <Link2 className="size-3.5" /> }
                ]}
            />
            {mode === "custom" && (
                <div className="popover-in mt-2.5">
                    <label htmlFor={urlId} className="sr-only">{label} link</label>
                    <input
                        id={urlId}
                        type="url"
                        inputMode="url"
                        value={url}
                        placeholder="https://example.com/image.png"
                        spellCheck={false}
                        autoComplete="off"
                        aria-invalid={Boolean(error) || undefined}
                        onChange={(event) => {
                            setUrl(event.target.value);
                            onChange(event.target.value);
                        }}
                        className={cn(inputClasses, "h-10 font-mono text-[0.8rem]")}
                    />
                    {error ? (
                        <p className="mt-1.5 text-[0.8rem] text-[var(--color-bad-300)]" role="alert">{error}</p>
                    ) : !url.trim() ? (
                        <p className="mt-1.5 text-[0.8rem] text-paper/60">Paste an https:// image link.</p>
                    ) : null}
                </div>
            )}
        </Field>
    );
}


export function RoleDot({ color }: { color: number }) {
    return (
        <span
            className="block size-3 rounded-full border border-black/20"
            style={{ background: color ? `#${color.toString(16).padStart(6, "0")}` : "#99AAB5" }}
            aria-hidden="true"
        />
    );
}
