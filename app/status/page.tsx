import { fetchBetterStackStatus, fetchBotApiStatus, ResourceIDS, StatusResource } from "./api";
import { StatusIcon, StatusChip, Cluster, ResourceStatus } from "./status.component";


export const revalidate = 60;
export default async function Home() {
    const betterstackStatus = await fetchBetterStackStatus();
    const botStatus = await fetchBotApiStatus();

    const downSites = betterstackStatus?.data?.filter(res => ["downtime"].includes(res.attributes.status)) ?? null;
    const overallStatus = downSites ? (downSites.length ? (downSites.length === (Object.keys(ResourceIDS).length-1) ? "downtime" : "partial") : "operational") : "downtime";

    const apiListSites = betterstackStatus?.data?.filter(res => [ResourceIDS.oreoApi, ResourceIDS.oreoProd].includes(res.attributes.resource_id)) ?? null;
    const apiListDownSites = apiListSites ? apiListSites.filter(res => res.attributes.status === 'downtime') : null;
    const apiListStatus = apiListDownSites ? (apiListDownSites.length ? (apiListDownSites.length === apiListSites?.length ? "downtime" : "partial") : "operational") : "downtime";

    const clusterDownList = botStatus ? Object.values(botStatus.clusters).filter(cl => cl.ping == 0) : null;
    const clustersStatus = clusterDownList ? (clusterDownList.length ? (clusterDownList.length === Object.values(botStatus?.clusters ?? {}).length ? "downtime" : "partial") : "operational") : "downtime";
    
    return (
        <div className="items-center md:w-3/4 mx-auto gap-10">
            <div className="flex flex-row bg-dark-800 items-center rounded-lg shadow-md gap-2 p-5 mb-10">
                <StatusIcon status={overallStatus} className="size-7" />
                <span className="text-xl font-medium text-white">
                    {{ operational: "All Services are Online", partial: "Some Services are Down", downtime: "All Services are Down" }[overallStatus]}
                </span>
            </div>
            {botStatus 
            ? 
                <div className="w-full bg-dark-800 rounded-lg shadow-md gap-3 p-5 mb-10">
                    <div className="flex flex-row justify-between w-full mt-1 mb-5">
                        <span className="w-full text-medium">Discord Bot</span>
                        <StatusChip status={clustersStatus}  />               
                    </div>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {Object.keys(botStatus.clusters).map(clusterId => (
                            <Cluster 
                                key={"cluster-" + clusterId}
                                {...botStatus.clusters[clusterId]}
                            />
                        ))}
                    </div>
                </div>
            : 
                <></>
            }
            {apiListSites 
            ? 
                <div className="w-full bg-dark-800 rounded-lg shadow-md gap-3 p-5 mb-10">
                    <div className="flex flex-row justify-between w-full mt-1 mb-5">
                        <span className="w-full text-medium">APIs</span>
                        <StatusChip status={apiListStatus}  />               
                    </div>
                    <div className="flex flex-col gap-6">
                        <ResourceStatus 
                            name="Youtube Notifications"
                            resource={apiListSites.find(res => res.attributes.resource_id === ResourceIDS.oreoApi) as StatusResource} 
                        />
                        <ResourceStatus 
                            name="Twitch Notifications"
                            resource={apiListSites.find(res => res.attributes.resource_id === ResourceIDS.oreoApi) as StatusResource} 
                        />
                        <ResourceStatus 
                            name="Rooter Notifications"
                            resource={apiListSites.find(res => res.attributes.resource_id === ResourceIDS.oreoApi) as StatusResource} 
                        />
                        <ResourceStatus 
                            name="Internal Api"
                            resource={apiListSites.find(res => res.attributes.resource_id === ResourceIDS.oreoProd) as StatusResource} 
                        />
                    </div>
                </div>
            : 
                <></>
            }
        </div>
    )
}