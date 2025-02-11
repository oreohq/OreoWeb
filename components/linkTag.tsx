import { ExternalLink } from "@/components/icons";
import Link from "next/link";
import cn from "@/utils/cn";


type Props = { href: string; children: React.ReactNode; className?: string; target?: "_self"|"_blank"|"_top"|"_present"; };
export default function LinkTag({ href, children, className, target }: Props) {
    return (
        <Link
            className={cn("underline text-oreo-600 decoration-oreo-600", className)}
            prefetch={false}
            target={target || "_blank"}
            href={href}
        >
            {children}
            {target && target === "_self" ? <></> : <ExternalLink className="inline ml-0.5 mb-0.5" />}
        </Link>
    )
}