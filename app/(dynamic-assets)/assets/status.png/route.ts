import { fetchBetterStackStatus, ResourceIDS } from "@/app/status/api";
import { getBaseUrl } from "@/utils/urls";

export const revalidate = 60;
export async function GET(request: Request) {
  const betterstackStatus = await fetchBetterStackStatus();
  
  const downSites = betterstackStatus?.data?.filter(res => ["downtime"].includes(res.attributes.status)) ?? null;
  const overallStatus = downSites ? (downSites.length ? (downSites.length === (Object.keys(ResourceIDS).length-1) ? "noup" : "someup") : "allup") : "noup";

  const response = await fetch(`${getBaseUrl()}/assets/status/${overallStatus}.png`);
  const arrayBuffer = await response.arrayBuffer();

  return new Response(arrayBuffer, { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });  
}