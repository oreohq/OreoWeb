import { redirect, notFound } from "next/navigation";


interface Props {
    params: Promise<{ pathname: string }>
}

export default async function Home({ params }: Props) {
    const { pathname } = await params;
    
    switch(pathname) {
        case "discord": return redirect("https://discord.gg/DNzh7H2dJv");
        case "support": return redirect("https://discord.gg/DNzh7H2dJv");
        case "topgg": return redirect("https://top.gg/bot/1021275413969899580");
        case "vote": return redirect("https://top.gg/bot/1021275413969899580/vote");
        case "add": return redirect("https://discord.com/oauth2/authorize?client_id=1021275413969899580&permissions=486464&integration_type=0&scope=bot+applications.commands");
        case "invite": return redirect("https://discord.com/oauth2/authorize?client_id=1021275413969899580&permissions=486464&integration_type=0&scope=bot+applications.commands");
        case "guides": return redirect("/guide/add");
        case "guide": return redirect("/guide/add");
        case "docs": return redirect("/guide/add");
        case "kofi": return redirect("https://ko-fi.com/aniket091");
        case "tutorials": return redirect("https://www.youtube.com/@oreobot");
    }

    notFound();
}