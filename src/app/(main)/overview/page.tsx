"use client";

import { useEffect, useState } from "react";
import { Card, SectionTitle, LoadingSpinner } from "@/components/ui"; 
import { useRepo } from "@/lib/RepoContext";
import { Icon } from "@/components/Icon";

type StatItem = { label: string; value: string; change: string; trend: string };
// UPDATED: Added 'message' field
type ActivityItem = { id: string; user: string; avatar: string; action: string; target: string; time: string; message?: string };
type CollabItem = { id: number; username: string; avatar: string; role: string };

export default function OverviewPage() {
  const { currentRepo } = useRepo();
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [collaborators, setCollaborators] = useState<CollabItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
        if (!currentRepo) return;
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/overview/data?owner=${currentRepo.owner}&repo=${currentRepo.name}`);
            if (!res.ok) throw new Error("Failed to load overview data");
            
            const data = await res.json();
            setStats(data.stats);
            setActivity(data.activity);
            setCollaborators(data.collaborators);
        } catch (err: unknown) {
            console.error(err);
            setError("Could not load repository data.");
        } finally {
            setLoading(false);
        }
    }

    fetchData();
  }, [currentRepo]);

  if (!currentRepo) {
      return (
          <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Please select a repository.</p>
          </div>
      );
  }

  if (loading) {
      return (
          <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner text="Analyzing repository..." />
          </div>
      );
  }

  if (error) {
      return <div className="p-10 text-red-400">{error}</div>;
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-background">
      <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-white">Overview</h1>
                <p className="text-sm text-gray-400 mt-1">Repository: {currentRepo.owner} / {currentRepo.name}</p>
            </div>
            <a 
                href={`https://github.com/${currentRepo.owner}/${currentRepo.name}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline flex items-center gap-1"
            >
                View on GitHub
                <Icon className="size-3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></Icon>
            </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
            <Card key={stat.label} className="p-4 bg-card">
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="mt-1 text-2xl font-bold text-gray-100">{stat.value}</div>
                <div className={`mt-1 text-xs ${stat.trend === 'down' ? 'text-red-400' : 'text-green-400'}`}>
                    {stat.change}
                </div>
            </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Collaborators List */}
            <div className="space-y-6">
            <Card className="p-4">
                <SectionTitle>Collaborators</SectionTitle>
                <div className="space-y-3 mt-3">
                    {collaborators.map((user) => (
                        <div key={user.id} className="flex items-center gap-3">
                            <div className="size-8 rounded bg-gray-700 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-sm">
                                <div className="text-gray-200 font-medium">{user.username}</div>
                                <div className="text-xs text-gray-500">{user.role}</div>
                            </div>
                        </div>
                    ))}
                    <div className="pt-2 border-t border-default">
                        <a href={`https://github.com/${currentRepo.owner}/${currentRepo.name}/settings/access`} target="_blank" rel="noopener noreferrer">
                        <button className="text-xs text-blue-400 hover:underline w-full text-left">
                            + Manage Access
                        </button>
                        </a>
                    </div>
                </div>
            </Card>
            </div>

            {/* Recent Activity Feed */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-200">Recent Activity</h3>
                <div className="space-y-0 relative border-l-2 border-default ml-3 pl-6 pb-2">
                    {activity.length === 0 ? (
                        <div className="text-sm text-gray-500 italic">No recent activity found.</div>
                    ) : (
                        activity.map((item) => (
                            <div key={item.id} className="mb-6 relative">
                                <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-default border-2 border-background" />
                                <div className="flex items-start gap-3">
                                    <div className="size-8 rounded-full bg-gray-800 border border-default flex items-center justify-center overflow-hidden shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.avatar} alt={item.user} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm text-gray-200">
                                            <span className="font-semibold">{item.user}</span>{" "}
                                            <span className="text-gray-400">{item.action}</span>{" "}
                                            <span className="text-blue-400 font-medium">{item.target}</span>
                                        </div>
                                        
                                        {/* UPDATED: Render the message if available */}
                                        {item.message && (
                                            <div className="text-xs text-gray-400 mt-0.5 truncate italic border-l-2 border-white/10 pl-2">
                                                &quot;{item.message}&quot;
                                            </div>
                                        )}
                                        
                                        <div className="text-xs text-gray-500 mt-0.5">{item.time}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}