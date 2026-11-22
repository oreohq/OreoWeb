import { PlatformId } from "@/lib/platforms";
import cn from "@/lib/cn";


type IconProps = { className?: string };

export function DiscordIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-5", className)} aria-hidden="true">
            <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127c-.598.35-1.22.645-1.873.891a.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
        </svg>
    );
}

export function AddIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-5", className)} aria-hidden="true">
            <path fillRule="evenodd" d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21Zm1.25 5.75a1.25 1.25 0 1 0-2.5 0v3.5h-3.5a1.25 1.25 0 1 0 0 2.5h3.5v3.5a1.25 1.25 0 1 0 2.5 0v-3.5h3.5a1.25 1.25 0 1 0 0-2.5h-3.5v-3.5Z" />
        </svg>
    );
}

function YoutubeIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-5", className)} aria-hidden="true">
            <path d="M23.5 6.507a3.005 3.005 0 0 0-2.113-2.13C19.505 3.869 12 3.869 12 3.869s-7.505 0-9.387.508A3.005 3.005 0 0 0 .5 6.507C0 8.4 0 12 0 12s0 3.6.5 5.493a3.005 3.005 0 0 0 2.113 2.13C4.495 20.131 12 20.131 12 20.131s7.505 0 9.387-.508a3.005 3.005 0 0 0 2.113-2.13C24 15.6 24 12 24 12s0-3.6-.5-5.493ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
        </svg>
    );
}

function TwitchIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-5", className)} aria-hidden="true">
            <path d="M4.265 0 1.5 4.147v16.588h5.53V24h3.235l3.235-3.265h4.15L23.5 15.21V0H4.265Zm17.157 14.235-3.235 3.265h-5.53l-3.235 3.265V17.5H4.882V1.765h16.54v12.47ZM17.5 5.912v6.088h-2.212V5.912H17.5Zm-5.53 0v6.088H9.76V5.912h2.21Z" />
        </svg>
    );
}

function KickIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-5", className)} aria-hidden="true">
            <path d="M2 2h6.4v5.867h2.133V5.733h2.134V2H21.2v7.867h-2.133V12H16.93v2.133h2.135V16.2H21.2V22h-8.533v-3.733h-2.134v-2.134H8.4V22H2V2Z" />
        </svg>
    );
}

export function PlatformIcon({ platform, className }: { platform: PlatformId, className?: string }) {
    switch (platform) {
        case "youtube": return <YoutubeIcon className={className} />;
        case "twitch": return <TwitchIcon className={className} />;
        case "kick": return <KickIcon className={className} />;
    }
}
