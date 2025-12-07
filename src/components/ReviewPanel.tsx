"use client";

import { useState } from "react";
import { Card, SectionTitle, Button } from "./ui";
import { type Comment } from "@/lib/mockAssets";

type ReviewState = "Needs changes" | "Pending" | "Approved";

type ReviewProps = {
  status: ReviewState;
  onStatusChange: (s: ReviewState) => void;
  comments: Comment[];
  onAddComment: (text: string) => void;
};

export default function ReviewPanel({ status, onStatusChange, comments, onAddComment }: ReviewProps) {
  const [draft, setDraft] = useState("");

  const handlePost = () => {
    if (!draft.trim()) return;
    onAddComment(draft.trim());
    setDraft("");
  };

  return (
    <div className="space-y-6 pb-6">
      
      {/* Panel 1: Status Control */}
      <Card className="p-4 space-y-3 bg-card border-default">
        <SectionTitle>Asset Status</SectionTitle>
        <div>
            <select
              className="input-base w-full"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as ReviewState)}
            >
              <option>Needs changes</option>
              <option>Pending</option>
              <option>Approved</option>
            </select>
        </div>
      </Card>

      {/* Panel 2: Conversation */}
      <Card className="p-4 space-y-4 bg-card border-default">
        <SectionTitle>Comments</SectionTitle>

        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 text-sm group">
               {/* Avatar */}
               <div className="size-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 text-xs font-bold text-gray-300 border border-default">
                  {c.user.slice(0, 2).toUpperCase()}
               </div>
               
               {/* Content */}
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="font-semibold text-gray-200">{c.user}</span>
                     <span className="text-xs text-gray-500">{c.date}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed bg-white/5 p-2 rounded-md rounded-tl-none border border-default/50">
                    {c.text}
                  </p>
               </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center text-gray-500 text-xs py-10">No comments yet. Be the first!</div>
          )}
        </div>

        {/* Input Area */}
        <div className="pt-3 border-t border-default space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment..."
            className="input-base min-h-[80px] resize-none"
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePost();
                }
            }}
          />
          <div className="flex justify-end">
            <Button 
                variant="primary" 
                size="sm" 
                onClick={handlePost}
                disabled={!draft.trim()}
            >
              Comment
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
}