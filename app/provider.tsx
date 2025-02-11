"use client";

import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();

interface Props { 
    children: React.ReactNode;
}

export function Provider({ children }: Props) {
    return (
        <NextUIProvider>
            <QueryClientProvider client={queryClient}>
                <main className="text-neutral-400 flex flex-col items-center justify-between w-6xl max-w-full px-4 md:px-5 pt-4 md:pt-5 mt-2 md:mt-10">
                    {children}
                </main>
            </QueryClientProvider>
        </NextUIProvider>
    );
}