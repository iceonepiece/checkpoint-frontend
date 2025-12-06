"use client";

import { Card, SectionTitle } from "@/components/ui";
import ActivityHeatmap from "@/components/ActivityHeatmap"; // Import the new component
import Link from "next/link";

// Mock Data for the dashboard
const STATS = [
  { label: "Total Assets", value: "1,204", change: "+12 this week" },
  { label: "Storage Used", value: "45.2 GB", change: "24% of quota" },
  { label: "Open Issues", value: "8", change: "3 critical" },
  { label: "Active Contributors", value: "12", change: "Online now: 4" },
];

const ACTIVITY_LOG = [
  { user: "Vibhumi S.", action: "pushed 3 commits to", target: "main", time: "2 hours ago", avatar: "VS" },
  { user: "Jarusrawee D.", action: "merged pull request", target: "#42 Fix Shader", time: "5 hours ago", avatar: "JD" },
  { user: "Art Lead", action: "locked", target: "forest_scene.png", time: "1 day ago", avatar: "AL" },
  { user: "Vibhumi S.", action: "uploaded new version", target: "mech_concept.jpg", time: "2 days ago", avatar: "VS" },
];

export default function OverviewPage() {
  return (
    <div className="flex-1 p-6 space-y-6 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Project Overview</h1>
        <button className="text-sm text-blue-400 hover:underline">View Settings</button>
      </div>

      {/* 1. Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="p-4 bg-[#0d1117]">
            <div className="text-sm text-gray-400">{stat.label}</div>
            <div className="mt-1 text-2xl font-bold text-gray-100">{stat.value}</div>
            <div className="mt-1 text-xs text-green-400">{stat.change}</div>
          </Card>
        ))}
      </div>

      {/* 2. Heatmap Section */}
      <section>
        <ActivityHeatmap />
      </section>

      {/* 3. Bottom Grid: Activity & Readme/Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-gray-200">Recent Activity</h3>
            <div className="space-y-0 relative border-l-2 border-[#30363d] ml-3 pl-6 pb-2">
                {ACTIVITY_LOG.map((item, i) => (
                    <div key={i} className="mb-6 relative">
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
              <SectionTitle>Collabolators</SectionTitle>
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
        </div>
      </div>
    </div>
  );
}