"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Icon } from "@/components/Icon";

export function DeleteModal({ isOpen, onClose, selectedCount, onConfirm }: any) {
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl surface-card p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Icon className="size-5 text-red-400"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Icon>
            Delete {selectedCount} items?
        </h2>
        <p className="text-sm text-gray-400">This will permanently remove the selected files from the repository history.</p>
        
        <div className="space-y-3">
            <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Commit Summary <span className="text-red-400">*</span></label>
                <input type="text" className="input-base" placeholder='e.g. "Delete old model"' value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
             <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Description (Optional)</label>
                <textarea className="input-base min-h-[80px]" placeholder="Add details..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={() => { onConfirm(message); setMessage(""); onClose(); }}>
                Commit Deletion
            </Button>
        </div>
      </div>
    </div>
  );
}