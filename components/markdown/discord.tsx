import { getDateString } from "@/utils/time";


export function Channel({ channelName }: { channelName: string; }) {
    return (
        <span className="bg-blurple/20 hover:bg-blurple/50 text-neutral-100 hover:text-white py-0.5 px-1 rounded-md font-light text-small duration-200 cursor-pointer">
            #{channelName}
        </span>
    )
}


export function Emoji({ emojiId }: { emojiId: string; }) {
    return (
        <img
            alt="emoji"
            className="rounded-sm h-5 w-5 select-none"
            src={`https://cdn.discordapp.com/emojis/${emojiId}.webp?size=40&quality=lossless`}
        />
    )
}


export function Timestamp({ date, unix, format }: { date?: Date, unix?:number, format: "t"|"T"|"d"|"D"|"F"|"R"|string }) {
    const stampDate = new Date(date ?? (unix ? unix * 1000 : Date.now()));
    const str = getDateString(stampDate, format);

    return (
        <span className="bg-neutral-300/10 hover:bg-neutral-300/25 text-neutral-100 hover:text-white py-1 px-2 rounded-md font-light text-small duration-200 cursor-pointer">
            {str}
        </span>
    )
}


export function User({ userName }: { userName: string; }) {
    return (
        <span className="bg-blurple/20 hover:bg-blurple/50 text-neutral-100 hover:text-white py-1 px-2 rounded-md font-light text-sm duration-200 cursor-pointer">
            @{userName}
        </span>
    )
}
