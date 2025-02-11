import { Footer } from "@/components/footer";

interface Props {
    children: React.ReactNode;
}


export default async function RootLayout({ children }: Props) {
    return (
        <div className="w-full">
            <div className="mb-20">{children}</div>
            <Footer />
        </div>
    )
}