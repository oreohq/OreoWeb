const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60]
];

export function timeAgo(value: string | number | Date, now = Date.now()): string {
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) return "";
    const seconds = Math.round((time - now) / 1000);
    if (Math.abs(seconds) < 45) return "just now";
    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit);
    }
    return relativeFormat.format(Math.round(seconds / 60), "minute");
}

export function formatDateTime(value: string | number | Date): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function formatDate(value: string | number | Date): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { dateStyle: "long" });
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat("en").format(value);
}


export function discordCalendar(value: string | number | Date, now = Date.now()): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    // Round, not floor, because across a clock change two midnights are 23 or 25 hours apart
    const diffDays = Math.round((startOfToday.getTime() - new Date(date).setHours(0, 0, 0, 0)) / 86_400_000);
    if (diffDays === 0) return `Today at ${time}`;
    if (diffDays === 1) return `Yesterday at ${time}`;
    return `${date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" })} ${time}`;
}


function discordRelative(date: Date, now = Date.now()): string {
    const diff = (date.getTime() - now) / 1000;
    const seconds = Math.abs(diff);
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    const text =
        seconds < 45 ? "a few seconds"
        : seconds < 90 ? "a minute"
        : minutes < 45 ? `${Math.round(minutes)} minutes`
        : minutes < 90 ? "an hour"
        : hours < 22 ? `${Math.round(hours)} hours`
        : hours < 36 ? "a day"
        : days < 26 ? `${Math.round(days)} days`
        : days < 45 ? "a month"
        : days < 320 ? `${Math.round(days / 30)} months`
        : days < 548 ? "a year"
        : `${Math.round(days / 365)} years`;

    return diff > 0 ? `in ${text}` : `${text} ago`;
}

export function discordTimestamp(unix: number, style = "f", now = Date.now()): string {
    const date = new Date(unix * 1000);
    if (!Number.isFinite(date.getTime())) return `<t:${unix}:${style}>`;
    switch (style) {
        case "t": return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
        case "T": return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" });
        case "d": return date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
        case "D": return date.toLocaleDateString(undefined, { dateStyle: "long" });
        case "F": return date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });
        case "R": return discordRelative(date, now);
        default: return date.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
    }
}


export function intToHex(value: number): string {
    return `#${Math.max(0, value).toString(16).padStart(6, "0").toUpperCase()}`;
}
