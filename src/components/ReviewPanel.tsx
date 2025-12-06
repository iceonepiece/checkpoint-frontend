"use client";

import { useState } from "react";
import { Card, SectionTitle } from "./ui";

type ReviewState = "Needs changes" | "Pending" | "Approved";

type ReviewProps = {
  initialStatus: ReviewState;
};

export default function ReviewPanel({ initialStatus }: ReviewProps) {
  const [status, setStatus] = useState(initialStatus);
  const [comments, setComments] = useState<string[]>([
    "Looks good overall, maybe lighten the metal.",
  ]);
  const [draft, setDraft] = useState("");

  return (
    <Card className="p-3 space-y-3">
      <SectionTitle>Review</SectionTitle>

      <div className="space-y-1">
        <label className="text-xs text-gray-400">Status</label>
        {/* Refactored: border-default, bg-background */}
        <select
          className="w-full rounded-md border border-default bg-background px-2 py-1.5 text-sm text-gray-200"
          value={status}
          onChange={(e) => setStatus(e.target.value as ReviewState)}
        >
          <option>Needs changes</option>
          <option>Pending</option>
          <option>Approved</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-400">Comments</label>
        <div className="space-y-2">
          {comments.map((c, i) => (
            // Refactored: border-default, bg-background
            <div key={i} className="rounded-md border border-default bg-background px-3 py-2 text-sm text-gray-200">
              {c}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {/* Refactored: border-default, bg-background */}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          className="min-h-[80px] w-full rounded-md border border-default bg-background px-3 py-2 text-sm text-gray-200 outline-none"
        />
        <div className="flex items-center justify-end gap-2">
          {/* Refactored: border-default, bg-background, hover:bg-card-hover */}
          <button className="rounded-md border border-default bg-background px-3 py-1.5 text-sm text-gray-200 hover:bg-card-hover">
            Create issue
          </button>
          <button
            onClick={() => { if (!draft.trim()) return; setComments((c) => [draft.trim(), ...c]); setDraft(""); }}
            className="rounded-md bg-[#238636] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2ea043]"
          >
            Comment
          </button>
        </div>
      </div>
    </Card>
  );
}