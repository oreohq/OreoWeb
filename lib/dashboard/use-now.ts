"use client";

import { useEffect, useState } from "react";


export function useNow(interval = 60_000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), interval);
        return () => window.clearInterval(timer);
    }, [interval]);
    return now;
}
