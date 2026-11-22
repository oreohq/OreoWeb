import { SmoothScroll } from "@/components/site/smooth-scroll";
import { NavBar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";


export function SiteChrome({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SmoothScroll />
            <NavBar />
            <main>{children}</main>
            <Footer />
        </>
    );
}
