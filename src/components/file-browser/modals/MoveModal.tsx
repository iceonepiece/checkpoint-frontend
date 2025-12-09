"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { MOCK_TREE, TreeNode } from "@/lib/mockFolderTree";

interface MoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    onConfirm: (targetId: string, message: string) => void;
}

function flattenFolders(nodes: TreeNode[], parentPath = "assets"): { id: string; path: string }[] {
  let folders: { id: string; path: string }[] = [];
  nodes.forEach(node => {
    const currentPath = parentPath ? `${parentPath}/${node.id}` : node.id;
    folders.push({ id: node.id, path: currentPath });
    if (node.children) {
      folders = [...folders, ...flattenFolders(node.children, currentPath)];
    }
  });
  return folders;
}

export function MoveModal({ isOpen, onClose, selectedCount, onConfirm }: MoveModalProps) {
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [targetId, setTargetId] = useState("chars"); 
  const [isVisible, setIsVisible] = useState(false);
  
  const folderOptions = flattenFolders(MOCK_TREE[0].children || []);

  useEffect(() => {
    if (isOpen) {
        setIsVisible(true);
    } else {
        const timer = setTimeout(() => setIsVisible(false), 300);
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ${isOpen ? "animate-fade-in" : "animate-fade-out"}`}>
      <div className={`w-full max-w-md rounded-xl surface-card p-6 shadow-2xl space-y-4 ${isOpen ? "animate-zoom-in" : "animate-zoom-out"}`}>
        <h2 className="text-lg font-semibold text-white">Move {selectedCount} items</h2>
        
        <div className="space-y-3">
            <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Destination</label>
                <select className="input-base" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
                    {folderOptions.map(f => (
                        <option key={f.id} value={f.id}>{f.path}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-3">
            <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Commit Summary <span className="text-red-400">*</span></label>
                <input type="text" className="input-base" placeholder='e.g. "Move asssets to..."' value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
             <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Description (Optional)</label>
                <textarea className="input-base min-h-[80px]" placeholder="Add details..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
        </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => { onConfirm(targetId, message); setMessage(""); onClose(); }}>
                Commit Move
            </Button>
        </div>
      </div>
    </div>
  );
}