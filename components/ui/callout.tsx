import { CircleAlert, CircleCheck, Info, TriangleAlert } from "@/components/ui/glyphs";
import cn from "@/lib/cn";


type Tone = "info" | "warning" | "danger" | "success" | "cream";

const tones: Record<Tone, { box: string, icon: string, Icon: typeof Info }> = {
    info: { box: "border-paper/8 bg-ink-800/70", icon: "bg-paper/[0.07] text-paper/75", Icon: Info },
    cream: { box: "border-cream-400/20 bg-cream-500/[0.07]", icon: "bg-cream-500/15 text-cream-400", Icon: Info },
    warning: { box: "border-warn/25 bg-warn/[0.07]", icon: "bg-warn/15 text-warn", Icon: TriangleAlert },
    danger: { box: "border-bad/25 bg-bad/[0.07]", icon: "bg-bad/15 text-[var(--color-bad-300)]", Icon: CircleAlert },
    success: { box: "border-ok/25 bg-ok/[0.07]", icon: "bg-ok/15 text-ok", Icon: CircleCheck }
};

interface Props {
    tone?: Tone;
    title?: React.ReactNode;
    children?: React.ReactNode;
    action?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
    role?: "alert" | "status";
}

export function Callout({ tone = "info", title, children, action, icon, className, role }: Props) {
    const style = tones[tone];
    const Icon = style.Icon;

    return (
        <div role={role} className={cn("flex flex-col gap-3 rounded-xl border px-3.5 py-3.5 sm:flex-row sm:items-center", style.box, className)}>
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg [&_svg]:size-4", style.icon)} aria-hidden="true">
                    {icon ?? <Icon />}
                </span>
                <div className="min-w-0 flex-1 text-sm leading-relaxed text-paper/65">
                    {title && <p className="font-medium text-paper">{title}</p>}
                    {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
                </div>
            </div>
            {action && <div className="flex shrink-0 flex-wrap gap-2 pl-10 sm:pl-0">{action}</div>}
        </div>
    );
}
