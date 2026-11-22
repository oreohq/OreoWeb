"use client";

import { useEffect, useRef, useState } from "react";
import cn from "@/lib/cn";


interface Props {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    as?: "div" | "section" | "li" | "article";
}

export function Reveal({ children, className, delay = 0, as: Tag = "div" }: Props) {
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        if (node.getBoundingClientRect().top < window.innerHeight) {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref as never}
            className={cn("reveal", visible && "is-visible", className)}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </Tag>
    );
}
