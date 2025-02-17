import { ArticleContent, Homebuttons, ContentAnimate } from "@/components/homeContent";
import { GuildsInfiniteScroll } from "@/components/homeGuilds";
import NotificationSVG from "@/public/assets/notifications.svg";
import RoleAlertsSVG from "@/public/assets/rolealerts.svg";
import CustomizeSVG from "@/public/assets/customize.svg";
import Update1SVG from "@/public/assets/update1.svg";
import Update2SVG from "@/public/assets/update2.svg";
import { Discord } from "@/components/icons";
import { Button } from "@nextui-org/react";
import { Faq } from "./faq.component";
import Link from "next/link";
import cn from "@/utils/cn";


export default async function Home() {
    const topGuilds = await fetch(`${process.env.NEXT_PUBLIC_API}/guilds`, {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}` },
        next: { revalidate: 60 * 60 }
    }).then(res => res.json()).catch(() => {});

    return (
        <div className="flex items-center flex-col w-full" >
            <div className="flex w-full items-center gap-8 mb-16 md:mb-12 min-h-[500px] h-[calc(100svh-14rem)] md:h-[calc(100svh-16rem)]">
                
                <div className="md:min-w-96 w-full flex flex-col space-y-6 items-center text-center">
                    <h1 className={cn("lg:text-7xl md:text-6xl text-5xl max-w-3xl whitespace-break-spaces tracking-tight font-semibold text-white")}>
                        <span>Notify your</span>
                        <span className="text-oreo-600 break-keep inline-flex items-center"> Discord </span>
                        <span>Community with ease.</span>
                    </h1>

                    <span className="text-lg font-medium max-w-2xl mb-4">
                        Get notified on your Discord Community whenever you or your favourite creator posts or goes live on Youtube, Rooter & Twitch within no time.
                    </span>

                    <Homebuttons />
                </div>
            </div>

            <div className="flex flex-col items-center space-x-2">
                <div className="rounded-full rotate-180 md:rounded-3xl md:rotate-0 scroll">
                    <div className="animate-scroll scroll-wheel" />
                </div>
            </div>

            <GuildsInfiniteScroll guilds={topGuilds?.guilds} guildCount={topGuilds?.guildCount} memberCount={topGuilds?.memberCount} />

            <article itemScope id="oreo-features" className="flex flex-col gap-52 my-36 px-2" itemType="http://schema.org/Article" >
                <ArticleContent 
                    title="Real Time Notifications"
                    description="Keep your community up-to-date with the latest notifications from your favorite creators. With real-time notifications, you’ll get lightning fast notification and never miss an upload or livestream. Our daily improvements ensure you're notified within seconds of a new upload!"
                    image={NotificationSVG}
                    imageFirst={false}
                />
                <ArticleContent 
                    title="Fully Customizable Notifications"
                    description="Make notifications your own! Customize the message format, add notification embed, and even choose specific Discord channels for alerts. Personalize the experience to match your server’s unique style and keep things organized. se our interactive slash commands to customize with just a few clicks!"
                    image={CustomizeSVG}
                    imageFirst={true}
                />
                <ArticleContent 
                    title="Auto Update Notifications"
                    description="Auto Sync Notification Posts! Whenever an uploaed is updated by the creator, oreo updates the corresponding notification message on discord ensuring your community has the lastest details."
                    images={[Update1SVG, Update2SVG]}
                    image={Update1SVG}
                    imageFirst={false}
                />
                <ArticleContent 
                    title="Role Based Alerts"
                    description="Ensure notifications reach only those who care! Assign specific roles to users who want updates about certain creators. This feature eliminates unnecessary notifications and keeps your server clutter-free."
                    image={RoleAlertsSVG}
                    imageFirst={true}
                />
            </article>

            <Faq />

            <div className="mt-28 mb-40">
                <ContentAnimate>
                    <div className="w-full flex flex-col gap-6 items-center text-center">
                        <h3 className="lg:text-4xl text-3xl font-semibold text-white" >Ready to take notifications to a new Level?</h3>
                        <Button
                            as={Link}
                            href="/invite"
                            target="_blank"
                            startContent={<Discord />}
                            className="!text-xl button-primary shadow-md"
                            size="lg"
                        >
                            Add to Discord
                        </Button>
                    </div>
                </ContentAnimate>   
            </div>
        </div>
    );
}