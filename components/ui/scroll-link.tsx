"use client";

import { PENDING_SCROLL_KEY, smoothScrollTo } from "@/lib/scroll";
import { usePathname, useRouter } from "next/navigation";


interface Props {
    to: string;
    children: React.ReactNode;
    className?: string;
    onNavigate?: () => void;
}

export function ScrollLink({ to, children, className, onNavigate }: Props) {
    const pathname = usePathname();
    const router = useRouter();

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

        event.preventDefault();
        onNavigate?.();

        if (pathname === "/") {
            smoothScrollTo(to);
            return;
        }

        try {
            sessionStorage.setItem(PENDING_SCROLL_KEY, to);
        } catch {
        }
        router.push("/");
    };

    return (
        <a href={`/#${to}`} onClick={handleClick} className={className}>
            {children}
        </a>
    );
}
