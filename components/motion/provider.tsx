"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";
import { EASE_OUT } from "@/lib/motion";


export function MotionProvider({ children }: { children: React.ReactNode }) {
    return (
        <LazyMotion features={domMax} strict>
            <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: EASE_OUT }}>
                {children}
            </MotionConfig>
        </LazyMotion>
    );
}
