"use client";
import { Accordion, AccordionItem, Code } from "@nextui-org/react";
import LinkTag from "@/components/linkTag";


const data = [
    {
        title: "How do I invite Oreo to my Server?",
        content: (
        <ol className="list-decimal list-inside marker:text-neutral-500 text-neutral-300" itemProp="text">
            <li>Make sure to have the <Code className="bg-oreo-700/20 text-oreo-600">Manage Server</Code> permission on the server you want <LinkTag href="/invite">invite Oreo</LinkTag> into.</li>
            <li>Open Discord{"'"}s bot invite page at <LinkTag href="/invite">oreos.fun/invite</LinkTag>.</li>
            <li>Select a server and click on {"\""}Continue{"\""}.</li>
            <li>Do <span className="font-semibold">not uncheck</span> any permissions and click on {"\""}Authorize{"\""}.</li>
            <li><span className="font-semibold">Done!</span> 🎉 To configure the bot use the <span className="font-semibold">/settings</span> Slash Command from the commands menu.</li>
        </ol>)
    },
    {
        title: "How do I configure Oreo for my Sever?",
        content: (
        <ol className="list-decimal list-inside marker:text-neutral-500 text-neutral-300" itemProp="text">
            <li>In the Discord App, in channel channel of your server, type <Code className="bg-oreo-700/20 text-oreo-600">/settings</Code>.</li>
            <li>From the popup displayed, click on Slash Command of Oreo and then execute it.</li>
            <li>Now use the differnt Settings Options present to configure the settings for the Server.</li>
            <li>For any help regarding configuration, refer to the guide <LinkTag href="/guide/add" target="_self">oreos.fun/guide</LinkTag>.</li>
            <li><span className="font-semibold">Done! 🎉</span></li>
        </ol>)
    },
    {
        title: "How do I disable a command for roles or channels?",
        content: (
        <ol className="list-decimal list-inside marker:text-neutral-500 text-neutral-300" itemProp="text">
            <li>In the Discord App, click on the servers&apos; name and click {"\""}Settings{"\""}.</li>
            <li>Then go to the tab {"\""}Integrations{"\""} in the {"\""}Apps{"\""} category.</li>
            <li>In the {"\""}Bots and Apps{"\""} list, find <span className="font-semibold">Oreo</span> and click on {"\""}Manage{"\""}.</li>
            <li>You can choose to disable commands for everyone by their roles, or only in certain channels.</li>
            <li><span className="font-semibold">Done!</span> 🎉</li>
        </ol>)
    },
    {
        title: "Which social platforms does Oreo Notifications support?",
        content: (
        <ol className="list-decimal list-inside marker:text-neutral-500 text-neutral-300" itemProp="text">
            <li><span className="font-semibold">Youtube Notifications:</span> Videos, Premieres, Shorts, Livestreams.</li>
            <li><span className="font-semibold">Twitch Notifications:</span> Videos, Livestreams.</li>
            <li><span className="font-semibold">Rooter Notifications:</span> Videos, Livestreams.</li>
        </ol>)
    }
];


export function Faq() {
    return (
        <div className="mb-24 mt-10 w-full md:w-[85%]" itemType="https://schema.org/FAQPage" itemScope>
            <h3 className="text-center lg:text-4xl text-3xl font-semibold text-white">Any questions? Read our FAQ</h3>
    
            <Accordion className="rounded-lg overflow-hidden mt-6 gap-y-4" variant="splitted" defaultExpandedKeys={["0"]} disableAnimation={false}>
                {data.map((item, index) => (
                <AccordionItem
                    aria-label={item.title}
                    className="!bg-dark-800 !shadow-md"
                    title={<span itemProp="name">{item.title}</span>}
                    classNames={{ base: "border-1 border-dark-700 hover:border-dark-600", title: "text-xl", content: "mb-2 !pb-2 !pt-0", indicator: "text-large" }}
                    itemType="https://schema.org/Question"
                    itemProp="mainEntity"
                    key={index}
                    itemScope
                >
                    <hr className="border-dark-600 mb-4"></hr>
                    <span
                        itemType="https://schema.org/Answer"
                        itemProp="acceptedAnswer"
                        itemScope
                    >
                        {item.content}
                    </span>
                </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}