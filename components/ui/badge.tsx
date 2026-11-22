import cn from "@/lib/cn";


export type BadgeTone = "neutral" | "cream" | "success" | "warning" | "danger" | "info" | "live";

const tones: Record<BadgeTone, string> = {
    neutral: "bg-paper/[0.06] text-paper/65 ring-paper/8",
    cream: "bg-cream-500/15 text-cream-300 ring-cream-400/25",
    success: "bg-ok/10 text-ok ring-ok/20",
    warning: "bg-warn/10 text-warn ring-warn/22",
    danger: "bg-bad/10 text-[var(--color-bad-300)] ring-bad/25",
    info: "bg-blurple/14 text-[#AEB5FF] ring-blurple/28",
    live: "bg-[#E5243F] text-white ring-transparent font-semibold tracking-[0.04em]"
};

interface Props extends React.ComponentPropsWithoutRef<"span"> {
    tone?: BadgeTone;
    icon?: React.ReactNode;
    size?: "sm" | "md";
}

export function Badge({ tone = "neutral", icon, size = "sm", className, children, ...props }: Props) {
    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset [&_svg]:shrink-0",
                size === "sm" ? "h-5 px-2 text-xs [&_svg]:size-3" : "h-6 px-2.5 text-xs [&_svg]:size-3.5",
                tones[tone],
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </span>
    );
}


