"use client";

import { use } from "react";
import { MOCK_ISSUES } from "@/lib/mockIssues";
import { Button, Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import Link from "next/link";

type Params = { params: Promise<{ id: string }> };

export default function IssueDetailPage(props: Params) {
  const params = use(props.params);
  const id = parseInt(params.id);
  const issue = MOCK_ISSUES.find(i => i.id === id) || MOCK_ISSUES[0];

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-6 max-w-screen-xl mx-auto">
        
        <div className="border-b border-default pb-4 mb-6">
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-normal text-gray-100">
                        {issue.title} <span className="text-gray-500 font-light">#{issue.id}</span>
                    </h1>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button size="sm">Edit</Button>
                    <Button variant="primary" size="sm">New issue</Button>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-2">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/40 border border-green-800 text-green-400 text-xs font-medium">
                    <Icon className="size-3.5"><circle cx="12" cy="12" r="10"/></Icon>
                    Open
                </span>
                <span className="font-semibold text-gray-300">{issue.author}</span>
                <span>opened this issue {issue.date}</span>
                <span>• {issue.commentsCount} comments</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 pb-10">
            
            <div className="space-y-8">
                
                <CommentItem 
                    author={issue.author} 
                    date={issue.date} 
                    avatar={issue.author.slice(0,2).toUpperCase()} 
                    body={issue.body} 
                    isOwner={true}
                />

                {issue.replies.length > 0 && (
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-default/50" />
                        </div>
                    </div>
                )}

                {issue.replies.map(reply => (
                    <CommentItem 
                        key={reply.id}
                        author={reply.author} 
                        date={reply.date} 
                        avatar={reply.avatar} 
                        body={reply.content} 
                        isOwner={reply.isOwner}
                    />
                ))}

                <div className="flex gap-4">
                    <div className="size-10 rounded-full bg-gray-700 shrink-0 border border-default" />
                    <Card className="flex-1 bg-background border-default">
                        <div className="p-2 border-b border-default bg-card rounded-t-lg flex gap-4 text-xs text-gray-400">
                            <span className="text-gray-100 font-medium">Write</span>
                            <span>Preview</span>
                        </div>
                        <div className="p-2">
                            <textarea 
                                className="w-full min-h-[100px] bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none resize-y"
                                placeholder="Leave a comment"
                            />
                        </div>
                        <div className="p-2 flex justify-end">
                            <Button variant="primary" disabled>Comment</Button>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="space-y-6 text-sm">
                <SidebarSection title="Assignees" empty="No one assigned" />
                <SidebarSection title="Labels" empty="None yet" />
                <SidebarSection title="Projects" empty="None yet" />
                <SidebarSection title="Milestone" empty="No milestone" />
                <SidebarSection title="Relationship" empty="None yet" />
            </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ author, date, avatar, body, isOwner }: any) {
    return (
        <div className="flex gap-4 group">

            <div className="size-10 rounded-full bg-gray-700 shrink-0 border border-default flex items-center justify-center text-xs text-gray-300 font-bold overflow-hidden">
                {avatar.length <= 2 ? avatar : <img src={avatar} alt="" className="w-full h-full object-cover"/>}
            </div>
            
            <Card className="flex-1 border-default bg-background">
                <div className="flex items-center gap-2 p-3 border-b border-default bg-card text-xs text-gray-400 rounded-t-lg">
                    <span className="font-semibold text-gray-200">{author}</span>
                    <span>commented {date}</span>
                    <div className="ml-auto flex items-center gap-2">
                        {isOwner && (
                            <span className="px-2 py-0.5 rounded-full border border-default text-gray-400 text-[10px] font-medium">
                                Owner
                            </span>
                        )}
                        <Icon className="size-4 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-white" ><path d="M12 5v14M5 12h14"/></Icon>
                    </div>
                </div>
                <div className="p-4 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {body}
                </div>
            </Card>
        </div>
    );
}

function SidebarSection({ title, empty }: { title: string, empty: string }) {
    return (
        <div className="pb-4 border-b border-default last:border-0">
            <div className="flex items-center justify-between text-gray-400 mb-1 hover:text-blue-400 cursor-pointer group">
                <span className="font-semibold text-xs group-hover:text-blue-400">{title}</span>
                <Icon className="size-3.5"><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></Icon>
            </div>
            <div className="text-xs text-gray-500">{empty}</div>
        </div>
    );
}