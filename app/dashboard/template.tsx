"use client";

import { EASE_OUT } from "@/lib/motion";
import { m } from "motion/react";


export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
    return (
        <m.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE_OUT }}>
            {children}
        </m.div>
    );
}
