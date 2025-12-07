"use client";

import { Card, SectionTitle } from "@/components/ui";
import ActivityHeatmap from "@/components/ActivityHeatmap"; 
import { PROJECT_STATS, RECENT_ACTIVITY, HEATMAP_DATA } from "@/lib/mockActivity"; 
import Link from "next/link";

export default function OverviewPage() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-background">
      <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
        
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-white">Repository Overview</h1>
            <a 
                href="https://github.com/Example-User/Checkpoint-Project/settings" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline flex items-center gap-1"
            >
                View Settings in GitHub
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_STATS.map((stat) => (
            <Card key={stat.label} className="p-4 bg-background">
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="mt-1 text-2xl font-bold text-gray-100">{stat.value}</div>
                <div className={`mt-1 text-xs ${stat.trend === 'down' ? 'text-red-400' : 'text-green-400'}`}>
                    {stat.change}
                </div>
            </Card>
            ))}
        </div>

        <section>
            <ActivityHeatmap data={HEATMAP_DATA} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-semibold text-gray-200">Recent Activity</h3>
                <div className="space-y-0 relative border-l-2 border-default ml-3 pl-6 pb-2">
                    {RECENT_ACTIVITY.map((item) => (
                        <div key={item.id} className="mb-6 relative">
                            <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-default border-2 border-background" />
                            <div className="flex items-start gap-3">
                                <div className="size-8 rounded-full bg-blue-900/50 border border-blue-800 flex items-center justify-center text-xs font-bold text-blue-200 shrink-0">
                                    {item.avatar}
                                </div>
                                <div>
                                    <div className="text-sm text-gray-200">
                                        <span className="font-semibold">{item.user}</span>{" "}
                                        <span className="text-gray-400">{item.action}</span>{" "}
                                        <span className="text-blue-400 font-medium hover:underline cursor-pointer">{item.target}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{item.time}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
            <Card className="p-4">
                <SectionTitle>Collaborators</SectionTitle>
                <div className="space-y-3 mt-3">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-gray-700" />
                        <div className="text-sm">
                            <div className="text-gray-200 font-medium">Vibhumi Sermsilp</div>
                            <div className="text-xs text-gray-500">Owner</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-gray-700" />
                        <div className="text-sm">
                            <div className="text-gray-200 font-medium">Jarusrawee D.</div>
                            <div className="text-xs text-gray-500">Collaborator</div>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-default">
                        <a href="https://github.com/Example-User/Checkpoint-Project/settings/access" target="_blank" rel="noopener noreferrer">
                        <button className="text-xs text-blue-400 hover:underline w-full text-left">
                            + Invite people
                        </button>
                        </a>
                    </div>
                </div>
            </Card>
            </div>
        </div>
      </div>
    </div>
  );
}