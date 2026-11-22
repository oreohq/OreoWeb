import Link from "next/link";
import cn from "@/lib/cn";


type SiteVariant = "cream" | "cocoa" | "ghost" | "blurple" | "danger" | "key" | "keyCocoa";
type AppVariant = "primary" | "secondary" | "subtle" | "destructive" | "discord";
type Variant = SiteVariant | AppVariant;
type Size = "xs" | "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
    cream: "bg-cream-500 text-cocoa-950 hover:bg-cream-400 shadow-[0_10px_34px_-12px] shadow-cream-500/70 font-semibold",
    cocoa: "bg-cocoa-700/80 text-cream-100 hover:bg-cocoa-600 border border-cream-200/10 font-medium backdrop-blur-sm",
    ghost: "text-cream-100/70 hover:text-cream-100 hover:bg-cream-100/6 font-medium",
    blurple: "bg-blurple text-white hover:brightness-110 font-semibold shadow-[0_10px_34px_-12px] shadow-blurple/70",
    danger: "bg-red-500/90 text-white hover:bg-red-500 font-semibold shadow-[0_10px_34px_-14px] shadow-red-500/70",
    key:
        "bg-cream-500 text-cocoa-950 font-bold shadow-[inset_0_2px_0_rgb(255_255_255/0.35),0_4px_0_var(--color-cream-800),0_16px_28px_-10px_rgb(0_0_0/0.7)] hover:bg-[var(--color-cream-450)] hover:shadow-[inset_0_2px_0_rgb(255_255_255/0.35),0_4px_0_var(--color-cream-800),0_18px_30px_-10px_rgb(0_0_0/0.7)] active:translate-y-1 active:scale-100 active:shadow-[inset_0_2px_0_rgb(255_255_255/0.35),0_0_0_var(--color-cream-800),0_6px_14px_-8px_rgb(0_0_0/0.7)]",
    keyCocoa:
        "bg-cocoa-600 text-cream-100 font-semibold shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_4px_0_var(--color-cocoa-900),0_16px_28px_-10px_rgb(0_0_0/0.7)] hover:bg-cocoa-500 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_4px_0_var(--color-cocoa-900),0_18px_30px_-10px_rgb(0_0_0/0.7)] active:translate-y-1 active:scale-100 active:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_0_var(--color-cocoa-900),0_6px_14px_-8px_rgb(0_0_0/0.7)]",

    primary:
        "bg-cream-500 text-cream-900 font-semibold accent-depth hover:bg-cream-450",
    secondary:
        "bg-ink-800 text-paper font-medium border border-paper/10 raised-depth hover:bg-ink-750 hover:border-paper/16",
    subtle: "text-paper/65 font-medium hover:text-paper hover:bg-paper/[0.06]",
    destructive: "bg-bad text-white font-semibold shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] hover:bg-[var(--color-bad-400)]",
    discord: "bg-blurple text-white font-semibold shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] hover:bg-[#6873F4]"
};

const siteSizes: Record<Size, string> = {
    xs: "h-8 px-3 text-xs rounded-lg gap-1.5",
    sm: "h-9 px-4 text-sm rounded-xl gap-1.5",
    md: "h-11 px-5 text-[0.95rem] rounded-2xl gap-2",
    lg: "h-13 px-7 text-base sm:text-lg rounded-2xl gap-2.5"
};

const appSizes: Record<Size, string> = {
    xs: "h-7 px-2.5 text-xs rounded-lg gap-1.5 [&_svg]:size-3.5",
    sm: "h-8 px-3 text-sm rounded-[0.625rem] gap-1.5 [&_svg]:size-4",
    md: "h-9 px-3.5 text-sm rounded-[0.625rem] gap-2 [&_svg]:size-4",
    lg: "h-10 px-4 text-sm rounded-xl gap-2 [&_svg]:size-4"
};

const APP_VARIANTS = new Set<Variant>(["primary", "secondary", "subtle", "destructive", "discord"]);

const base =
    "inline-flex items-center justify-center whitespace-nowrap select-none transition-[background-color,border-color,color,transform,opacity,box-shadow] duration-150 ease-snappy active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none";


interface Props extends React.ComponentPropsWithRef<"button"> {
    variant?: Variant;
    size?: Size;
    href?: string;
    external?: boolean;
    prefetch?: boolean;
}

export function Button({ variant = "cream", size = "md", href, external, prefetch = false, className, children, type = "button", ...props }: Props) {
    const classes = cn(base, variants[variant], (APP_VARIANTS.has(variant) ? appSizes : siteSizes)[size], className);

    if (href) {
        return (
            <Link
                href={href}
                prefetch={prefetch}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className={classes}
            >
                {children}
            </Link>
        );
    }

    return (
        <button type={type} className={classes} {...props}>
            {children}
        </button>
    );
}
