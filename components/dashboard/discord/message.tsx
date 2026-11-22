"use client";

import type { RenderedButton, RenderedEmbed, RenderedMessage } from "@/lib/notification/render";
import { DiscordMarkdown, type MarkdownContext } from "@/components/dashboard/discord/markdown";
import { discordCalendar, intToHex } from "@/lib/dashboard/format";
import { ExternalLink, ImageOff } from "@/components/ui/glyphs";
import { BUTTON_EMOJIS } from "@/lib/notification/emojis";
import { CookieMark } from "@/components/ui/cookie";
import { useEffect, useRef, useState } from "react";
import { safeUrl } from "@/lib/safe-url";
import cn from "@/lib/cn";


interface Props {
    message: RenderedMessage;
    context?: MarkdownContext;
    edited?: boolean;
    sentAt?: number;
    interactive?: boolean;
    className?: string;
}

export function DiscordMessage({ message, context, edited, sentAt, interactive = true, className }: Props) {
    const [clock, setClock] = useState<string | null>(null);
    // The clock depends on the viewer's timezone, so it only renders in the browser
    useEffect(() => setClock(discordCalendar(sentAt ?? Date.now())), [sentAt]);

    return (
        <article className={cn("relative flex gap-4 py-1 pl-0 pr-2 text-[0.9375rem] leading-[1.375rem] text-[#DBDEE1]", className)}>
            <span className="mt-0.5 size-10 shrink-0 overflow-hidden rounded-full bg-ink-700" aria-hidden="true">
                <CookieMark className="size-full" />
            </span>

            <div className="min-w-0 flex-1">
                <header className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span className="font-medium text-[#F2F3F5]">Oreo</span>
                    <span className="inline-flex h-[0.9375rem] items-center gap-0.5 rounded-[4px] bg-blurple px-1 text-[0.625rem] font-semibold uppercase leading-none text-white">
                        <svg viewBox="0 0 16 16" className="size-2.5" aria-hidden="true">
                            <path fill="currentColor" d="M6.4 11.2 3 7.8l1.1-1.1 2.3 2.3 5.5-5.5L13 4.6z" />
                        </svg>
                        App
                    </span>
                    <time className="ml-0.5 text-xs text-[#949BA4]" suppressHydrationWarning>
                        {clock ?? " "}
                    </time>
                </header>

                {message.content && (
                    <div className="relative">
                        <DiscordMarkdown content={message.content} context={context} links={interactive || "inert"} />
                        {edited && <span className="ml-1 text-[0.625rem] text-[#949BA4]">(edited)</span>}
                    </div>
                )}

                {message.embed && <Embed embed={message.embed} context={context} interactive={interactive} />}
                {!message.content && edited && <span className="text-[0.625rem] text-[#949BA4]">(edited)</span>}

                {message.buttons.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-2">
                        {message.buttons.map((button, index) => (
                            <DiscordButton key={`${button.label}-${index}`} button={button} interactive={interactive} />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}


function Embed({ embed, context, interactive }: { embed: RenderedEmbed, context?: MarkdownContext, interactive: boolean }) {
    const color = intToHex(embed.color);
    const links = interactive || "inert";
    const authorUrl = interactive ? safeUrl(embed.author?.url) : undefined;
    const inline = embed.fields.filter((field) => field.inline).length;

    return (
        <div
            className="mt-1 grid max-w-[520px] overflow-hidden rounded-[4px] border-l-4 bg-[#2B2D31]"
            style={{ borderLeftColor: color }}
        >
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-4 px-3 pb-4 pt-2 sm:pl-3 sm:pr-4">
                <div className="min-w-0">
                    {embed.author && (
                        <div className="mt-2 flex min-w-0 items-center gap-2">
                            {embed.author.iconUrl && <EmbedImage src={embed.author.iconUrl} className="size-6 rounded-full" alt="" />}
                            {authorUrl ? (
                                <a href={authorUrl} target="_blank" rel="noreferrer noopener" className="truncate text-sm font-semibold text-[#F2F3F5] hover:underline">
                                    {embed.author.name}
                                </a>
                            ) : (
                                <span className="truncate text-sm font-semibold text-[#F2F3F5]">{embed.author.name}</span>
                            )}
                        </div>
                    )}

                    {embed.title && (
                        <div className="mt-2 text-base font-semibold leading-snug">
                            {safeUrl(embed.url) && interactive ? (
                                <a href={safeUrl(embed.url)} target="_blank" rel="noreferrer noopener" className="text-[#00A8FC] hover:underline">
                                    <DiscordMarkdown content={embed.title} context={context} mode="inline" links={false} className="inline" />
                                </a>
                            ) : safeUrl(embed.url) ? (
                                <DiscordMarkdown content={embed.title} context={context} mode="inline" links={false} className="text-[#00A8FC]" />
                            ) : (
                                <DiscordMarkdown content={embed.title} context={context} mode="inline" links={false} className="text-[#F2F3F5]" />
                            )}
                        </div>
                    )}

                    {embed.description && (
                        <DiscordMarkdown
                            content={embed.description}
                            context={context}
                            links={links}
                            className="mt-2 text-sm leading-[1.125rem] text-[#DBDEE1]"
                        />
                    )}

                    {embed.fields.length > 0 && (
                        <div className="@container mt-2">
                            <div className={cn("grid gap-x-2 gap-y-2", inline >= 2 ? "grid-cols-1 @[13rem]:grid-cols-2 @[24rem]:grid-cols-3" : "grid-cols-1")}>
                                {embed.fields.map((field, index) => (
                                    <div key={index} className={cn("min-w-0", !field.inline && "col-span-full")}>
                                        <div className="mb-0.5 text-sm font-semibold leading-[1.125rem] text-[#F2F3F5]">{field.name}</div>
                                        <DiscordMarkdown content={field.value} context={context} links={links} className="text-sm leading-[1.125rem] text-[#DBDEE1]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {embed.thumbnail && (
                    <EmbedImage src={embed.thumbnail} alt="Thumbnail" className="mt-2 size-20 rounded-[4px] object-cover" />
                )}

                {embed.image && (
                    <div className="col-span-full mt-4">
                        <EmbedImage src={embed.image} alt="Image" className="aspect-video w-full max-w-[400px] rounded-[4px] object-cover" />
                    </div>
                )}

                {(embed.footer || embed.timestamp) && (
                    <div className="col-span-full mt-2 flex min-w-0 items-center gap-2 text-xs text-[#DBDEE1]/85">
                        {embed.footer?.iconUrl && <EmbedImage src={embed.footer.iconUrl} alt="" className="size-5 rounded-full" />}
                        <span className="min-w-0 truncate">
                            {embed.footer?.text}
                            {embed.footer?.text && embed.timestamp && <span className="mx-1">•</span>}
                            {embed.timestamp && <FooterTime value={embed.timestamp} />}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}


function FooterTime({ value }: { value: string }) {
    const [text, setText] = useState<string | null>(null);
    useEffect(() => setText(discordCalendar(value)), [value]);
    return <span suppressHydrationWarning>{text ?? ""}</span>;
}


function ownAsset(src: string): string {
    const url = new URL(src);
    return url.origin === "https://oreo.aniket.zip" ? `${url.pathname}${url.search}` : src;
}

function EmbedImage({ src: raw, alt, className }: { src: string, alt: string, className?: string }) {
    const web = safeUrl(raw);
    const current = web ? ownAsset(web) : "";
    const [failed, setFailed] = useState(!current);
    const image = useRef<HTMLImageElement>(null);
    // A server-rendered image can fail before hydration, when React isn't listening for onError yet
    useEffect(() => {
        const node = image.current;
        setFailed(!current || Boolean(node?.complete && node.naturalWidth === 0));
    }, [current]);

    const onError = () => setFailed(true);

    if (failed) {
        return (
            <span className={cn("grid place-items-center bg-[#1E1F22] text-[#949BA4]", className)} title={web ? `Couldn't load ${web}` : `Not a web image link: ${raw.slice(0, 200)}`}>
                <ImageOff className="size-1/3 max-h-8 max-w-8" aria-hidden="true" />
                <span className="sr-only">Image failed to load</span>
            </span>
        );
    }

    return (
        <img ref={image} src={current} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={onError} className={cn("bg-[#1E1F22]", className)} />
    );
}


function DiscordButton({ button, interactive }: { button: RenderedButton, interactive: boolean }) {
    const classes = cn(
        "inline-flex h-8 min-w-[3.75rem] items-center justify-center gap-1.5 rounded-lg bg-[#4E5058] px-4 text-sm font-medium text-white transition-colors",
        button.disabled ? "cursor-not-allowed opacity-50" : "hover:bg-[#6D6F78]"
    );
    const emoji = button.style === "link" ? BUTTON_EMOJIS.link : button.customId?.startsWith("oreo:notify:") ? BUTTON_EMOJIS.role : null;
    const content = (
        <>
            {emoji ? <img src={emoji} alt="" className="size-[1.125rem]" /> : button.emoji && <span aria-hidden="true">{button.emoji}</span>}
            <span>{button.label}</span>
            {button.style === "link" && <ExternalLink className="size-3.5 opacity-80" aria-hidden="true" />}
        </>
    );

    const href = button.style === "link" && interactive ? safeUrl(button.url) : undefined;
    if (href) {
        return (
            <a href={href} target="_blank" rel="noreferrer noopener" className={classes}>
                {content}
            </a>
        );
    }
    return (
        <span className={classes} role="presentation" title={button.customId?.startsWith("oreo:notify:") ? "Members press this to get the ping roles" : undefined}>
            {content}
        </span>
    );
}
