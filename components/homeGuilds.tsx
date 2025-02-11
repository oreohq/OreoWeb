import PartneredSVG from "@/public/assets/partnered.svg";
import VerifiedSVG from "@/public/assets/verified.svg";
import GuildsJSON from "@/public/guilds.json"; 
import { ClassValue } from "clsx";
import Image from "next/image";
import cn from "@/utils/cn";


interface GuildInfo {
    name: string;
    icon: string;
    partnered: boolean;
    verified: boolean;
}

type Props = { guilds?: GuildInfo[]; guildCount?: string; memberCount?: string; };
export function GuildsInfiniteScroll({ guilds, guildCount, memberCount }: Props) {
    const guildsList = guilds?.length ? guilds : GuildsJSON.guilds;
    return (
        <div className="mt-10 relative w-full">
            <div className="bg-dark-950 absolute w-screen h-full z-[-10]" style={{ width: "100vw", left: "calc(50% - 50vw)" }}></div>
            
            <div className="w-full text-center flex flex-col gap-14 py-28">
                <div className="flex flex-col gap-3">
                    <h3 className="lg:text-4xl text-3xl text-white font-semibold">Active in <span className="text-oreo-600 font-bold">{guildCount ?? GuildsJSON.guildCount}</span> Communities</h3>
                    <span className="text-xl text-white" >managing more than <span className="text-oreo-600 text-bold">{memberCount ?? GuildsJSON.memberCount}</span> members</span>
                </div>

                <div className="w-full flex flex-col gap-5">
                    <GuildsList guildsArray={Array.from(guildsList).slice(0, 10)} invert={false} />
                    <GuildsList guildsArray={Array.from(guildsList).slice(10, 20)} invert={true} />
                </div>
            </div>
        </div>
    )
}



type ListProps = { guildsArray: GuildInfo[], className?: ClassValue, invert?: boolean };
function GuildsList({ guildsArray, className, invert = false }: ListProps) {
    const gradient = "[mask-image:_linear-gradient(to_right,transparent_0,_black_40px,_black_calc(100%-40px),transparent_100%)] md:[mask-image:_linear-gradient(to_right,transparent_0,_black_150px,_black_calc(100%-150px),transparent_100%)]";
    return (
        <div className={cn("w-full flex-nowrap inline-flex overflow-hidden [mask-image:guild-list]", gradient, className)}>
            <ul className={cn("flex items-center justify-center gap-4 whitespace-nowrap pl-3", invert ? "animate-infinite-scroll-invert" : "animate-infinite-scroll")} aria-hidden="false" >
                {guildsArray.map((guild, i) => (<GuildComponent guild={guild} key={"guild" + i} />) )}
            </ul>
            <ul className={cn("flex items-center justify-center gap-4 whitespace-nowrap pl-3", invert ? "animate-infinite-scroll-invert" : "animate-infinite-scroll")} aria-hidden="true" >
                {guildsArray.map((guild, i) => (<GuildComponent guild={guild} key={"guild" + i} />) )}
            </ul>
        </div>
    )
}


function GuildComponent({ guild } : { guild: GuildInfo }) {
    return (
        <li className="inline-block">
            <div className="bg-dark-800 items-center rounded-xl flex flex-row gap-3 p-2 select-none w-max">
                <div className="aspect-square shrink-0 rounded-large overflow-hidden">
                    <Image alt="icon" className="w-12" draggable={false} loading="lazy" src={guild.icon} width={512} height={512} />
                </div>
                <div className="flex flex-row items-center gap-1.5 pr-1">
                    {guild.partnered || guild.verified ? 
                        <Image alt="" className="w-5" itemProp="image" loading="lazy" draggable={false} width={16} height={16} src={guild.partnered ? PartneredSVG : VerifiedSVG} /> 
                    : <></>}
                    <span className="text-xl font-medium text-white whitespace-nowrap">{guild.name}</span>
                </div>
            </div>
        </li>
    )
}