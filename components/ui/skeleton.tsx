import cn from "@/lib/cn";


export function Skeleton({ className, style }: { className?: string, style?: React.CSSProperties }) {
    return <span className={cn("skeleton block rounded-lg", className)} style={style} aria-hidden="true" />;
}
