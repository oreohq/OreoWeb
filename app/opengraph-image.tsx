import { SITE_TITLE } from "@/lib/metadata";
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";


export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
    const logo = `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public", "oreo.png"))).toString("base64")}`;

    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: "0 96px", background: "#17161C", color: "#FFF3E9" }}>
                <img src={logo} width={300} height={300} alt="" />
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ fontSize: 96, fontWeight: 900, color: "#FFA277", letterSpacing: -2 }}>Oreo</div>
                    <div style={{ fontSize: 44, lineHeight: 1.25, maxWidth: 640 }}>Keep your Discord community in the loop.</div>
                    <div style={{ fontSize: 28, opacity: 0.6 }}>YouTube, Twitch and Kick notifications</div>
                </div>
            </div>
        ),
        size
    );
}
