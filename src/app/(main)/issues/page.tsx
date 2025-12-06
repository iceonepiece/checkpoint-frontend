"use client";

import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { MOCK_ISSUES } from "@/lib/mockIssues";

function Icon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} />;
}

function IssueIcon({ status }: { status: string }) {
  if (status === "open") {
    return (
      <Icon className="size-4 text-green-400">
        <path d="M12 22c5.523 0 10-10 10-10S17.523 2 12 2 2 12 2 12s4.477 10 10 10z" />
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      </Icon>
    );
  }
  return <Icon className="size-4 text-purple-400"><path d="M20 6L9 17l-5-5" /></Icon>;
}

export default function IssuesPage() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 w-full max-w-4xl flex gap-2">
            {/* Fake Search Bar */}
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    defaultValue="is:issue state:open" 
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 pl-8 text-sm text-gray-200 focus:border-blue-500 outline-none" 
                />
                <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-500"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>
            </div>
            <div className="flex gap-1">
                <Button size="sm" className="hidden sm:flex">Labels</Button>
                <Button size="sm" className="hidden sm:flex">Milestones</Button>
            </div>
        </div>
        <Button variant="primary">New issue</Button>
      </div>

      {/* Issues List Card */}
      <Card className="overflow-hidden border-[#30363d] bg-[#161b22]">
        {/* List Header */}
        <div className="flex items-center gap-4 p-4 border-b border-[#30363d] bg-[#161b22] text-sm">
           <div className="flex items-center gap-1 font-semibold text-gray-200">
              <IssueIcon status="open" />
              <span>4 Open</span>
           </div>
           <div className="flex items-center gap-1 text-gray-400 hover:text-gray-200 cursor-pointer">
              <Icon className="size-4"><path d="M5 12l5 5 5-5" /></Icon>
              <span>21 Closed</span>
           </div>
           
           {/* Filters (Visual only) */}
           <div className="ml-auto hidden md:flex items-center gap-6 text-gray-400">
               <span className="hover:text-gray-200 cursor-pointer flex items-center gap-1">Author <Icon className="size-3"><path d="M6 9l6 6 6-6"/></Icon></span>
               <span className="hover:text-gray-200 cursor-pointer flex items-center gap-1">Label <Icon className="size-3"><path d="M6 9l6 6 6-6"/></Icon></span>
               <span className="hover:text-gray-200 cursor-pointer flex items-center gap-1">Projects <Icon className="size-3"><path d="M6 9l6 6 6-6"/></Icon></span>
               <span className="hover:text-gray-200 cursor-pointer flex items-center gap-1">Sort <Icon className="size-3"><path d="M6 9l6 6 6-6"/></Icon></span>
           </div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-[#30363d]">
            {MOCK_ISSUES.map(issue => (
                <div key={issue.id} className="group flex items-start gap-3 p-3 sm:px-4 hover:bg-[#1c2128]">
                    <div className="mt-1">
                        <IssueIcon status={issue.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Link href={`/issues/${issue.id}`} className="font-semibold text-gray-100 hover:text-blue-400 text-[15px] truncate">
                                {issue.title}
                            </Link>
                            {issue.labels.map(label => (
                                <span key={label.name} className={`px-2 py-0.5 rounded-full text-xs font-medium border ${label.color} ${label.bg} ${label.border}`}>
                                    {label.name}
                                </span>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500">
                            #{issue.id} opened {issue.date} by <span className="text-gray-400 hover:text-blue-400 cursor-pointer">{issue.author}</span>
                        </div>
                    </div>
                    
                    {issue.commentsCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Icon className="size-3"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></Icon>
                            {issue.commentsCount}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </Card>
    </div>
  );
}