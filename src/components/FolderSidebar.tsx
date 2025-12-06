"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { TreeNode } from "@/lib/mockFolderTree";
import { MOCK_TREE } from "@/lib/mockFolderTree";

// ... [Keep Caret, FolderIcon, TreeItem components as is, they are fine logic-wise] ...
// I will just show the main exported component with updated styles:

// (Assuming Caret/FolderIcon/TreeItem are defined above exactly as before)
// Re-paste helper components if you deleted them, or just update the Sidebar below:

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
  const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
  const selected = selectedId === node.id;

  return (
    <div>
      <button
        onClick={() => (isFolder ? toggle(node.id) : onSelect(node, fullPath))}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${selected ? "bg-[#1c2128] text-white font-medium" : "text-gray-400 hover:bg-[#1c2128] hover:text-gray-200"}`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <span className="text-gray-500">{isFolder ? <Caret open={open} /> : <span className="w-3" />}</span>
        <FolderIcon open={open} />
        <span className="truncate">{node.name}</span>
      </button>

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
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const toggle = (id: string) => setExpanded((m) => ({ ...m, [id]: !m[id] }));
  const onSelect = (node: TreeNode, fullPath: string) => {
    setSelectedId(node.id);
    const qp = new URLSearchParams(params.toString());
    qp.set("path", fullPath);
    router.push(`/?${qp.toString()}`);
  };

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-default bg-[#0d1117] md:flex">
      <div className="p-4 border-b border-default mb-2">
        <div className="text-sm font-semibold text-gray-200">Files</div>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {tree.map((n) => (
          <TreeItem key={n.id} node={n} depth={0} expanded={expanded} toggle={toggle} selectedId={selectedId} onSelect={onSelect} parentPath="" />
        ))}
      </div>
    </aside>
  );
}