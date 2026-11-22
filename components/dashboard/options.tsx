import { SENDABLE_TYPES, sidebarOrder } from "@/lib/dashboard/resources";
import { CircleAlert, Hash, Megaphone } from "@/components/ui/glyphs";
import type { ComboOption } from "@/components/ui/combobox";
import type { GuildResources } from "@/lib/api/types";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiError } from "@/lib/api/client";
import cn from "@/lib/cn";


export function sendableChannelOptions(resources: GuildResources | undefined): ComboOption[] {
    if (!resources) return [];
    return sidebarOrder(resources.channels, (item) => SENDABLE_TYPES.includes(item.type)).map(({ channel, group }) => ({
        value: channel.id,
        label: channel.name,
        group,
        icon: channel.type === "announcement" ? <Megaphone className="size-4" /> : <Hash className="size-4" />,
        warn: !channel.canSend,
        hint: !channel.canSend ? "Can't post" : channel.type === "announcement" ? "Announcement" : undefined,
        keywords: channel.type
    }));
}


export function PickerFallback({ error, onRetry, className }: { error?: ApiError, onRetry?: () => void, className?: string }) {
    if (!error) return <Skeleton className={cn("h-10 w-full rounded-[0.625rem]", className)} />;
    return (
        <div role="alert" className={cn("flex min-h-10 items-center gap-2 rounded-[0.625rem] border border-bad/25 bg-bad/[0.05] px-3 py-2 text-xs text-[var(--color-bad-200)]", className)}>
            <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1" title={error.message}>
                Couldn&apos;t load this server&apos;s channels and roles.
            </span>
            {onRetry && (
                <button type="button" onClick={onRetry} className="shrink-0 font-medium text-paper/80 underline-offset-2 hover:text-paper hover:underline">
                    Retry
                </button>
            )}
        </div>
    );
}
