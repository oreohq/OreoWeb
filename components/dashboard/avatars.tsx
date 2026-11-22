import type { Creator, PlatformName } from "@/lib/api/types";
import { platformColor } from "@/lib/dashboard/platforms";
import { PlatformIcon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import cn from "@/lib/cn";


export function GuildIcon({ name, iconUrl, className }: { name: string, iconUrl: string | null | undefined, className?: string }) {
    return <Avatar src={iconUrl} name={name} shape="rounded" className={cn("size-10 text-sm", className)} />;
}


export function PlatformBadge({ platform, className }: { platform: PlatformName, className?: string }) {
    return (
        <span
            className={cn("grid size-5 place-items-center rounded-full bg-ink-950 ring-2 ring-ink-850", className)}
            style={{ color: platformColor(platform) }}
        >
            <PlatformIcon platform={platform} className="size-3" />
        </span>
    );
}


export function CreatorAvatar({
    creator,
    className,
    badgeClassName
}: {
    creator: Pick<Creator, "displayName" | "avatarUrl" | "platform">;
    className?: string;
    badgeClassName?: string;
}) {
    return (
        <span className="relative inline-flex w-fit shrink-0">
            <Avatar src={creator.avatarUrl} name={creator.displayName} className={cn("size-11 text-sm", className)} />
            <PlatformBadge platform={creator.platform} className={cn("absolute -bottom-0.5 -right-0.5", badgeClassName)} />
        </span>
    );
}
