import { CircleAlert } from "@/components/ui/glyphs";
import cn from "@/lib/cn";


interface FieldProps {
    label: React.ReactNode;
    htmlFor?: string;
    labelId?: string;
    description?: React.ReactNode;
    descriptionId?: string;
    error?: React.ReactNode;
    errorId?: string;
    aside?: React.ReactNode;
    optional?: boolean;
    required?: boolean;
    tag?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function Field({
    label,
    htmlFor,
    labelId,
    description,
    descriptionId,
    error,
    errorId,
    aside,
    optional,
    required,
    tag,
    children,
    className
}: FieldProps) {
    return (
        <div className={cn("min-w-0", className)}>
            <div className="mb-1.5 flex min-h-5 items-end justify-between gap-3">
                <label id={labelId} htmlFor={htmlFor} className="flex items-center gap-1.5 text-sm font-medium text-paper/85">
                    {label}
                    {required && <span className="text-bad" aria-hidden="true">*</span>}
                    {optional && <span className="text-xs font-normal text-paper/50">Optional</span>}
                    {tag}
                </label>
                {aside}
            </div>
            {children}
            {description && !error && (
                <p id={descriptionId} className="mt-1.5 text-xs leading-relaxed text-paper/60">
                    {description}
                </p>
            )}
            {error && (
                <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-[var(--color-bad-300)]" role="alert">
                    <CircleAlert className="mt-px size-3.5 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
}


export const inputClasses = cn(
    "w-full rounded-[0.625rem] border border-paper/10 bg-ink-800 px-3 text-sm text-paper",
    "shadow-[var(--input-shadow)] placeholder:text-paper/45",
    "transition-[border-color,box-shadow,background-color] duration-150 ease-snappy",
    "hover:border-paper/16 focus:border-cream-400/60 focus:bg-ink-800 focus:outline-none focus:ring-[3px] focus:ring-cream-500/15",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-[invalid=true]:border-bad/60 aria-[invalid=true]:focus:ring-bad/15"
);

export function Input({ className, ...props }: React.ComponentPropsWithRef<"input">) {
    return <input className={cn(inputClasses, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentPropsWithRef<"textarea">) {
    return <textarea className={cn(inputClasses, "block min-h-24 resize-y py-2.5 leading-relaxed", className)} {...props} />;
}


export function CharCount({ value, max, id }: { value: number, max: number, id?: string }) {
    const ratio = value / max;
    return (
        <span
            id={id}
            className={cn(
                "text-xs font-medium tabular-nums",
                ratio > 1 ? "text-[var(--color-bad-300)]" : ratio > 0.9 ? "text-warn" : "text-paper/50"
            )}
        >
            {value.toLocaleString()} / {max.toLocaleString()}
        </span>
    );
}
