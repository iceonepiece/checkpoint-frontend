"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { TreeNode } from "@/lib/mockFolderTree";
import { MOCK_TREE } from "@/lib/mockFolderTree";
import { Icon } from "@/components/Icon"; // Refactored Import

function Caret({ open }: { open: boolean }) {
  return <svg className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>;
}

function FolderIcon({ open }: { open: boolean }) {
  return <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill={open ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">{open ? <path d="M3 7h5l2 2h11v10H3z" /> : <path d="M3 7h5l2 2h11M3 7v10h18" />}</svg>;
}

type ItemProps = {
  node: TreeNode;
  depth: number;
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
  selectedId?: string;
  onSelect: (node: TreeNode, fullPath: string) => void;
  parentPath: string;
};

function TreeItem({ node, depth, expanded, toggle, selectedId, onSelect, parentPath }: ItemProps) {
  const isFolder = !!node.children?.length;
  const open = !!expanded[node.id];
  const fullPath = parentPath ? `${parentPath}/${node.id}` : node.id;
  const selected = selectedId === node.id;

  return (
    <div>
      {/* Row Container */}
      <div
        className={`flex w-full items-center gap-0.5 rounded-md py-0.5 pr-2 text-sm transition-colors ${selected ? "bg-card-hover text-white font-medium" : "text-gray-400 hover:bg-card-hover hover:text-gray-200"}`}
        style={{ paddingLeft: 6 + depth * 20 }}
      >
        {/* Zone 1: Expand/Collapse Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isFolder) toggle(node.id);
          }}
          className={`flex size-6 shrink-0 items-center justify-center rounded-sm transition-colors ${
            isFolder 
              ? "hover:bg-white/10 hover:text-white cursor-pointer" 
              : "cursor-default"
          }`}
        >
          {isFolder ? <Caret open={open} /> : <div className="size-3" />}
        </button>

        {/* Zone 2: Navigation */}
        <button
          onClick={() => onSelect(node, fullPath)}
          className="flex flex-1 items-center gap-2 truncate px-1 py-1 text-left rounded-sm cursor-pointer"
        >
          <FolderIcon open={open} />
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      {/* Children */}
      {isFolder && open && (
        <div>
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} expanded={expanded} toggle={toggle} selectedId={selectedId} onSelect={onSelect} parentPath={fullPath} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderSidebar({ tree = MOCK_TREE }: { tree?: TreeNode[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ assets: true, scenes: true });
  
  const currentPath = params.get("path");
  const currentId = currentPath ? currentPath.split("/").pop() : undefined;
  const [selectedId, setSelectedId] = useState<string | undefined>(currentId);

  const toggle = (id: string) => setExpanded((m) => ({ ...m, [id]: !m[id] }));
  
  const onSelect = (node: TreeNode, fullPath: string) => {
    setSelectedId(node.id);
    const qp = new URLSearchParams(params.toString());
    qp.set("path", fullPath);
    router.push(`/?${qp.toString()}`);
  };

  return (
    // Refactored: border-default, bg-background
    <aside className="hidden w-72 shrink-0 flex-col border-r border-default bg-background md:flex">
      <div className="p-4 border-b border-default mb-2">
        <div className="flex items-center justify-between">
           <div className="text-sm font-semibold text-gray-200">Directories</div>
        </div>
        
        <div className="mt-3 relative group">
            {/* Refactored: Used 'input-base' class instead of manual styles */}
            <input type="text" placeholder="Filter folders..." className="input-base pl-8 text-xs bg-card border-default" />
            <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-500 group-focus-within:text-blue-400"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        {tree.map((n) => (
          <TreeItem key={n.id} node={n} depth={0} expanded={expanded} toggle={toggle} selectedId={selectedId} onSelect={onSelect} parentPath="" />
        ))}
      </div>
    </aside>
  );
}