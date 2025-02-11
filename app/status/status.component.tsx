import { CheckCircle, DoubleCircle, ExclamationCircle, GreenStatus, LightningBolt, RedStatus, XCircle } from "@/components/icons";
import { ClusterResource, HistoryStatus, Status, StatusHistory, StatusResource } from "./api";
import { Chip, Divider } from "@nextui-org/react";
import { stackDay, stackDowntime } from "@/utils/time";
import cn from "@/utils/cn";


export function ResourceStatus({ name, resource }: { name: string; resource: StatusResource }) {
    return (
        <div>
            <div className="flex flex-row justify-between items-center w-full mb-1.5">
                <div className="flex flex-row items-center">
                    <StatusIcon status={resource.attributes.status} className="size-4" />
                    <span className="whitespace-nowrap text-medium text-white ml-1">{name}</span>
                </div>
                <span className={cn("whitespace-nowrap text-sm text-neutral-300", resource.attributes.status_history?.[89].status === "recovered" ? "text-status-green" : "")}>
                    {Number((resource.attributes.availability ?? 0) * 100).toFixed(2)}% uptime
                </span>
            </div>
            <div className="grid grid-cols-30 lg:grid-cols-90 gap-[5px] items-center justify-center h-10 place-items-center mb-1.5">
                {resource.attributes.status_history?.map((history, i) => (
                    <StatusItem history={history} index={i} key={`status${i}`} />
                ))}
            </div>
            <div className="flex flex-row justify-between w-full text-sm">
                <span className="whitespace-nowrap text-start hidden lg:inline">90 days ago</span>
                <span className="whitespace-nowrap text-start lg:hidden">30 days ago</span>
                <span className="whitespace-nowrap text-end">Today</span>
            </div>
        </div>
    )
}


export function Cluster(cluster: ClusterResource) {
    return (
        <div className="bg-dark-900 w-full space-y-2 duration-200 rounded-lg shadow-md p-4 h-fit" id={"cluster" + cluster.id}>
            <div className="w-full flex flex-row justify-between items-center">
                <div className="flex gap-1 items-center">
                    <EmojiIcon ping={cluster.ping} />
                    <span className="text-neutral-100 text-lg font-medium ml-1">{cluster.name}</span>
                    <span className="text-neutral-300 ml-0.5">#{Number(cluster.id) + 1}</span>
                </div>
                <Chip 
                    startContent={<LightningBolt className="size-4 ml-1.5" />}
                    className={cn("select-none bg-opacity-20", cluster.ping > 0 ? "bg-emerald-400 text-emerald-400" : "bg-red-400 text-red-400")} 
                >
                    {cluster.id === 0 ? "master, " : ""}{cluster.ping}ms
                </Chip>
            </div>
            {cluster.ping > 0 
            ?
                (<div>
                    <div><span className="text-neutral-300 font-medium" >{cluster.memory}mb</span> memory</div>
                    <div><span className="text-neutral-300 font-medium" >{cluster.guilds}</span> guilds</div>
                    <div><span className="text-neutral-300 font-medium" >{cluster.users}</span> users</div>
                </div>)
            : 
                <></>
            }
        </div>
    )
}


export function StatusChip({ status, className }: { status: Status; className?: string; }) {
    return (
        <div className={cn("flex flex-row items-center gap-1.5", className ?? "")} >
            <StatusIcon status={status} className="size-5" />
            <span className="whitespace-nowrap">{status === "operational" ? "Operational" : status === "partial" ? "Partial Outage" : "Downtime"}</span>
        </div>
    )
}


function EmojiIcon({ ping }: { ping: number; }) {
    return (ping > 0 ? <GreenStatus className="size-5" /> : <RedStatus className="size-5 text-status-red" />);
}


export function StatusIcon({ status, className }: { status: Status | HistoryStatus; className?: string; }) {
    switch(status) {
        case "operational": return (<CheckCircle className={cn("text-status-green", className)}/>);
        case "recovered": return (<CheckCircle className={cn("text-status-green", className)}/>);
        case "downtime": return (<XCircle className={cn("text-status-red", className)}/>);
        case "partial": return (<ExclamationCircle className={cn("text-orange-400", className)}/>);
        case "maintance": return (<ExclamationCircle className={cn("text-status-blue", className)}/>);
        case "degraded": return (<ExclamationCircle className={cn("text-orange-400", className)}/>);
        case "not_monitored": return (<DoubleCircle className={cn("text-neutral-500", className)}/>);
    }
}


function StatusItem({ history, index }: { history: StatusHistory; index: number; }) {
    const itemText = { operational: "Operational", downtime: "Downtime", recovered: "State Recovered", maintance: "Maintance", degraded: "Degraded Performance", not_monitored: "Not Monitored" };
    let itemClass = { operational: "bg-status-green", downtime: "bg-status-red h-9", recovered: "", maintance: "bg-status-blue", degraded: "bg-status-orange", not_monitored: "bg-neutral-500" }[history.status];
    if (history.downtime_duration > 0) itemClass = "h-9 " + (history.downtime_duration > 3600 ? (history.downtime_duration > 14400 ? "bg-status-red" : "bg-status-orange") : "bg-status-green opacity-80");
    return (
        <div className={cn("w-full relative group block", index < 60 ? "hidden lg:block" : "")}>
            <div className={cn("h-7.5 w-1.25 rounded-sm duration-150 hover:h-10 hover:opacity-7", itemClass)}></div>
            <div className="opacity-0 group-hover:opacity-100 absolute duration-200 origin-bottom -translate-x-1/2 flex flex-col bg-dark-900 border-1 border-dark-600 rounded-lg gap-1 z-[100] min-w-52 py-1 px-2 select-none">
                
                <div className="flex flex-col p-2 w-fit gap-1">
                    <div className="flex items-center gap-1 text-neutral-200">
                        <StatusIcon status={history.status} className="size-4" />
                        {itemText[history.status]}
                    </div>
                    {history.downtime_duration > 0 ? (
                        <span className="text-small">{stackDowntime(history.downtime_duration) + (history.status === "recovered" ? ", now operational" : "")}</span>
                    ) : <></>}
                </div>

                <Divider className="bg-dark-600" />
                <span className="text-small text-center text-neutral-500">{stackDay(history.day)}</span>
            </div>
        </div>
    )
}