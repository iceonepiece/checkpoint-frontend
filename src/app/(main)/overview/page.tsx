"use client";

import { Card, SectionTitle } from "@/components/ui";
import ActivityHeatmap from "@/components/ActivityHeatmap"; 
import { PROJECT_STATS, RECENT_ACTIVITY, HEATMAP_DATA } from "@/lib/mockActivity";
import Link from "next/link";

export default function OverviewPage() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#0d1117]">
      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
        
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-white">Project Overview</h1>
            <button className="text-sm text-blue-400 hover:underline">View Settings</button>
        </div>

        {/* 1. Top Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_STATS.map((stat) => (
            <Card key={stat.label} className="p-4 bg-[#0d1117]">
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="mt-1 text-2xl font-bold text-gray-100">{stat.value}</div>
                <div className={`mt-1 text-xs ${stat.trend === 'down' ? 'text-red-400' : 'text-green-400'}`}>
                    {stat.change}
                </div>
            </Card>
            ))}
        </div>

        {/* 2. Heatmap Section - Now passing data props */}
        <section>
            <ActivityHeatmap data={HEATMAP_DATA} />
        </section>

        {/* 3. Bottom Grid: Activity & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Activity Feed */}
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-semibold text-gray-200">Recent Activity</h3>
                <div className="space-y-0 relative border-l-2 border-[#30363d] ml-3 pl-6 pb-2">
                    {RECENT_ACTIVITY.map((item) => (
                        <div key={item.id} className="mb-6 relative">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-[#30363d] border-2 border-[#0d1117]" />
                            
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

            {/* Right Column: Team / Quick Links */}
            <div className="space-y-6">
            <Card className="p-4">
                <SectionTitle>Team Members</SectionTitle>
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
                    <div className="pt-2 border-t border-[#30363d]">
                        <button className="text-xs text-blue-400 hover:underline w-full text-left">
                            + Invite people
                        </button>
                    </div>
                </div>
            </Card>

            <Card className="p-4 border-yellow-900/30 bg-yellow-900/5">
                <h4 className="text-sm font-semibold text-yellow-500 mb-1">Storage Alert</h4>
                <p className="text-xs text-yellow-200/70 mb-3">
                    You have used 80% of your free tier storage.
                </p>
                <button className="text-xs bg-[#21262d] border border-[#30363d] text-gray-200 px-2 py-1 rounded hover:bg-[#30363d]">
                    Upgrade Plan
                </button>
            </Card>
            </div>
        </div>
      </div>
    </div>
  );
}