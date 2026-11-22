import { LegalPage } from "../legal";
import { pageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
    title: "Terms of Service",
    description: "The terms that govern your use of the Oreo Discord bot.",
    path: "/terms"
});

export default function Terms() {
    return <LegalPage name="terms" />;
}
