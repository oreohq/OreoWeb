import { Footer } from "@/components/footer";

interface Props {
    params: { pathname: string[] };
    children: React.ReactNode;
}


export default async function RootLayout({ params, children }: Props) {
    return (
        <div className="w-full">
            <div className="mb-20">{children}</div>
            <Footer />
        </div>
    )
}