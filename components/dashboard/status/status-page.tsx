"use client";

import { overallState, useServiceStatus, useStatusHistory } from "@/lib/api/status";
import { StatusBoard } from "@/components/status/status-board";
import { PageHeader } from "@/components/dashboard/states";
import { ExternalLink } from "@/components/ui/glyphs";
import { Button } from "@/components/ui/button";


export function DashboardStatusPage() {
    const status = useServiceStatus();
    const history = useStatusHistory();
    const unreachable = overallState(status) === "unreachable";

    return (
        <div className="mx-auto w-full max-w-[60rem] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            <PageHeader
                title="Status"
                description="Oreo's API, bot and platform connections right now, and their last 90 days."
                actions={
                    <Button variant="secondary" size="lg" href="/status" external>
                        Public status page
                        <ExternalLink />
                    </Button>
                }
            />
            <div className="mt-6">
                <StatusBoard
                    status={status.data ?? null}
                    history={history.data ?? null}
                    unreachable={unreachable}
                    checkedAt={status.data ? Date.parse(status.data.checkedAt) : 0}
                    every={30_000}
                    headline="h2"
                />
            </div>
        </div>
    );
}
