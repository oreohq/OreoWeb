"use client";

import { platformColor, platformName } from "@/lib/dashboard/platforms";
import type { GuildCreator, GuildLive } from "@/lib/api/types";
import { CreatorAvatar } from "@/components/dashboard/avatars";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/dashboard/format";
import { useNow } from "@/lib/dashboard/use-now";
import { Radio } from "@/components/ui/glyphs";
import { safeUrl } from "@/lib/safe-url";
import { EASE_OUT } from "@/lib/motion";
import { m } from "motion/react";
import Link from "next/link";


export function LiveNowCard({
    guildId,
    live,
    creators
}: {
    guildId: string;
    live: GuildLive | undefined | null;
    creators: GuildCreator[];
}) {
    const now = useNow();
    const rows = (live ?? [])
        .map((entry) => ({ entry, item: creators.find((creator) => creator.id === entry.guildCreatorId) }))
        .filter((row): row is { entry: GuildLive[number], item: GuildCreator } => Boolean(row.item));

    return (
        <section className="panel flex flex-col rounded-2xl" aria-labelledby="live-heading">
            <header className="flex items-center justify-between px-5 pt-5">
                <h2 id="live-heading" className="flex items-center gap-2.5 font-display text-xl leading-tight text-paper">
                    <span className="icon-chip size-8 [&_svg]:size-4" aria-hidden="true"><Radio /></span>
                    Live now
                    {rows.length > 0 && <span className="live-dot text-[#FF3B55]" aria-hidden="true" />}
                </h2>
                {rows.length > 0 && <span className="rounded-full bg-ok/12 px-2.5 py-1 text-xs font-semibold tabular-nums text-ok">{rows.length} streaming</span>}
            </header>

            <div className="flex flex-1 flex-col p-2">
                {live === undefined && (
                    <div className="space-y-1 p-2" aria-hidden="true">
                        {[0, 1].map((index) => (
                            <div key={index} className="flex items-center gap-3 py-1.5">
                                <Skeleton className="aspect-video w-24 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-3/4" />
                                    <Skeleton className="h-2.5 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {live !== undefined && rows.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
                        <span className="icon-chip size-12 rounded-2xl [&_svg]:size-5" aria-hidden="true">
                            <Radio />
                        </span>
                        <p className="mt-3 text-sm font-medium text-paper/85">Nobody&apos;s live right now</p>
                        <p className="mt-1 max-w-60 text-sm leading-relaxed text-paper/65">
                            {live === null ? "Live status isn't available at the moment." : "When one of your creators goes live, they show up here."}
                        </p>
                    </div>
                )}

                <ul className="space-y-0.5">
                    {rows.map(({ entry, item }, index) => {
                        const thumbnail = safeUrl(entry.content?.thumbnail);
                        return (
                            <m.li
                                key={entry.guildCreatorId}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: EASE_OUT, delay: index * 0.04 }}
                            >
                                <Link
                                    href={`/dashboard/${guildId}/creators/${item.id}`}
                                    className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-paper/[0.04]"
                                >
                                    <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-ink-700">
                                        {thumbnail ? (
                                            <img
                                                src={thumbnail}
                                                alt=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer"
                                                className="size-full object-cover transition-transform duration-500 ease-out-quint group-hover:scale-105"
                                            />
                                        ) : (
                                            <span
                                                className="absolute inset-0"
                                                style={{ background: platformColor(item.creator.platform) }}
                                            />
                                        )}
                                        <span className="absolute left-1 top-1 rounded-[3px] bg-[#E5243F] px-1 text-[0.5625rem] font-bold leading-4 tracking-wide text-white">
                                            LIVE
                                        </span>
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-paper" title={entry.content?.title}>
                                            {entry.content?.title || `${item.creator.displayName} is live`}
                                        </span>
                                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-paper/60">
                                            <CreatorAvatar creator={item.creator} className="size-4 text-[0.4rem]" badgeClassName="hidden" />
                                            <span className="truncate">{item.creator.displayName}</span>
                                            {entry.content?.startedAt && (
                                                <>
                                                    <span aria-hidden="true">·</span>
                                                    <span className="shrink-0">{timeAgo(entry.content.startedAt, now).replace(" ago", "")}</span>
                                                </>
                                            )}
                                        </span>
                                        {entry.content?.category && (
                                            <span className="mt-0.5 block truncate text-xs text-paper/50">
                                                {entry.content.category} on {platformName(item.creator.platform)}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            </m.li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
