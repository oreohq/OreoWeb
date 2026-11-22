import { LegalPage } from "../legal";
import { pageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
    title: "Privacy Policy",
    description: "What data Oreo stores, why it is stored, and how to have it removed.",
    path: "/privacy"
});

export default function Privacy() {
    return <LegalPage name="privacy" />;
}
