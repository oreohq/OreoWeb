
export function Mention({ name }: { name: string }) {
    return (
        <span className="rounded bg-blurple/25 px-1 py-px font-medium text-[#c9cdfb]">
            @{name}
        </span>
    );
}

export function Channel({ name }: { name: string }) {
    return (
        <span className="rounded bg-blurple/25 px-1 py-px font-medium text-[#c9cdfb]">
            #{name}
        </span>
    );
}

export function Emoji({ id }: { id: string }) {
    return (
        <img
            src={`https://cdn.discordapp.com/emojis/${id}.webp?size=44`}
            alt="emoji"
            loading="lazy"
            className="mx-px inline size-5 align-text-bottom"
        />
    );
}

export function Timestamp({ unix, format }: { unix: number, format: string }) {
    const date = new Date(unix * 1000);
    const label =
        format === "R"
            ? relative(date)
            : date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

    return <span className="rounded bg-blurple/20 px-1 py-px text-[#c9cdfb]">{label}</span>;
}


function relative(date: Date) {
    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ["year", 31536000],
        ["month", 2592000],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60]
    ];

    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
    }
    return formatter.format(seconds, "second");
}
