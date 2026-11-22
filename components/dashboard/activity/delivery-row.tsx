"use client";

import { CircleCheck, CircleSlash, CircleX, Clock, ExternalLink, Hash } from "@/components/ui/glyphs";
import { CONTENT_TYPE_NAMES, platformColor, platformName } from "@/lib/dashboard/platforms";
import { formatDateTime, timeAgo } from "@/lib/dashboard/format";
import type { Delivery, DeliveryStatus } from "@/lib/api/types";
import { discordMessageUrl, safeUrl } from "@/lib/safe-url";
import { PlatformIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/tooltip";
import cn from "@/lib/cn";


const DELIVERY_STATUS: Record<DeliveryStatus, { label: string, icon: React.ReactNode, className: string }> = {
    sent: { label: "Sent", icon: <CircleCheck />, className: "text-ok" },
    failed: { label: "Failed", icon: <CircleX />, className: "text-[var(--color-bad-300)]" },
    pending: { label: "Sending", icon: <Clock />, className: "text-warn" },
    skipped: { label: "Skipped", icon: <CircleSlash />, className: "text-paper/55" }
};


export function DeliveryRow({
    delivery,
    guildId,
    channelName,
    now,
    compact
}: {
    delivery: Delivery;
    guildId: string;
    channelName?: string;
    now: number;
    compact?: boolean;
}) {
    const status = DELIVERY_STATUS[delivery.status] ?? DELIVERY_STATUS.skipped;
    const type = CONTENT_TYPE_NAMES[delivery.contentType]?.one ?? "Post";
    const href = safeUrl(delivery.url);
    const messageUrl = delivery.status === "sent" ? discordMessageUrl(guildId, delivery.channelId, delivery.messageId) : undefined;
    const title = delivery.title || `Untitled ${type.toLowerCase()}`;

    return (
        <div className={cn("flex items-start gap-3", compact ? "px-4 py-2.5" : "px-4 py-3 sm:px-5")}>
            <Tooltip content={status.label}>
                <span className={cn("mt-0.5 shrink-0 [&_svg]:size-4", status.className)} role="img" aria-label={status.label}>
                    {status.icon}
                </span>
            </Tooltip>

            <div className="min-w-0 flex-1">
                {href ? (
                    <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="group/link inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-paper hover:text-cream-300"
                    >
                        <span className="truncate">{title}</span>
                        <ExternalLink className="size-3 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-60" aria-hidden="true" />
                        <span className="sr-only">(opens {platformName(delivery.platform)})</span>
                    </a>
                ) : (
                    <span className="block truncate text-sm font-medium text-paper">{title}</span>
                )}
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-paper/60">
                    <span className="inline-flex items-center gap-1">
                        <span style={{ color: platformColor(delivery.platform) }} aria-hidden="true">
                            <PlatformIcon platform={delivery.platform} className="size-3" />
                        </span>
                        {delivery.creatorName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{type}</span>
                    {channelName && !compact && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-0.5"><Hash className="size-3" />{channelName}</span>
                        </>
                    )}
                    {messageUrl && !compact && (
                        <>
                            <span aria-hidden="true">·</span>
                            <a href={messageUrl} target="_blank" rel="noreferrer" className="font-medium text-cream-400 hover:text-cream-300">
                                Jump to message
                            </a>
                        </>
                    )}
                </p>
                {delivery.error && (
                    <p className={cn("mt-1.5 rounded-lg border border-bad/15 bg-bad/[0.05] px-2.5 py-1.5 text-xs leading-relaxed text-[var(--color-bad-200)]", compact && "line-clamp-2")}>
                        {delivery.error}
                    </p>
                )}
            </div>

            <time dateTime={delivery.createdAt} title={formatDateTime(delivery.createdAt)} className="mt-0.5 shrink-0 text-xs tabular-nums text-paper/50">
                {timeAgo(delivery.createdAt, now)}
            </time>
        </div>
    );
}
