"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon"; 
import { useRepo } from "@/lib/RepoContext";
import { LoadingSpinner } from "@/components/ui"; // Import

// Local type definition
type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
  isRoot?: boolean;
};

/* --- UTILITY: Build Tree from Flat Paths --- */
function buildTreeFromPaths(items: { path: string }[]): TreeNode[] {
  const root: TreeNode[] = [];
  const nodesByPath: Record<string, TreeNode> = {};

  items.forEach(item => {
    const parts = item.path.split('/');
    const name = parts[parts.length - 1];
    nodesByPath[item.path] = { id: name, name: name, children: [] };
  });

  items.forEach(item => {
    const node = nodesByPath[item.path];
    const parts = item.path.split('/');
    
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join('/');
      const parent = nodesByPath[parentPath];
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        root.push(node);
      }
    } else {
      root.push(node);
    }
  });

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(n => {
        if (n.children) sortNodes(n.children);
    });
  };
  sortNodes(root);

  return root;
}

/* --- HELPER COMPONENTS --- */
function Caret({ open }: { open: boolean }) {
  return <svg className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>;
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg 
      className="h-4 w-4 text-blue-400 shrink-0" 
      viewBox="0 0 24 24" 
      fill={!open ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2"
    >
      {open 
        ? <path d="M3 7h5l2 2h11v10H3z" /> 
        : <path d="M3 7h5l2 2h11v8H3z" /> 
      }
    </svg>
  );
}

/* --- FILTER LOGIC --- */
function filterTree(nodes: TreeNode[], term: string): TreeNode[] {
  if (!term) return nodes;
  
  return nodes
    .map((node): TreeNode | null => {
      const matchesSelf = node.name.toLowerCase().includes(term.toLowerCase());
      const filteredChildren = node.children ? filterTree(node.children, term) : undefined;
      const hasMatchingChildren = filteredChildren && filteredChildren.length > 0;

      if (matchesSelf || hasMatchingChildren) {
        return { ...node, children: filteredChildren };
      }
      return null;
    })
    .filter((n): n is TreeNode => n !== null);
}

/* --- COMPONENTS --- */
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
  const isFolder = !!node.children && node.children.length > 0; 
  
  const myPath = node.isRoot 
    ? "" 
    : parentPath 
        ? `${parentPath}/${node.id}` 
        : node.id;

  const uniqueId = node.isRoot ? "ROOT" : myPath;
  const open = !!expanded[uniqueId];
  
  const selected = node.isRoot 
    ? selectedId === undefined || selectedId === "" 
    : selectedId === node.id; 

  return (
    <div>
      <div
        className={`flex w-full items-center gap-0.5 rounded-md py-0.5 pr-2 text-sm transition-colors ${selected ? "bg-card-hover text-white font-medium" : "text-gray-400 hover:bg-card-hover hover:text-gray-200"}`}
        style={{ paddingLeft: 6 + depth * 20 }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isFolder || node.isRoot) toggle(uniqueId);
          }}
          className={`flex size-6 shrink-0 items-center justify-center rounded-sm transition-colors ${
            (isFolder || node.isRoot)
              ? "hover:bg-white/10 hover:text-white cursor-pointer" 
              : "cursor-default"
          }`}
        >
          {(isFolder || node.isRoot) ? <Caret open={open} /> : <div className="size-3" />}
        </button>

        <button
          onClick={() => onSelect(node, myPath)}
          className="flex flex-1 items-center gap-2 truncate px-1 py-1 text-left rounded-sm cursor-pointer"
        >
          {node.isRoot ? (
             <FolderIcon open={open} />
          ) : (
             <FolderIcon open={open} />
          )}
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      {(isFolder || node.isRoot) && open && node.children && (
        <div>
          {node.children.map((child, index) => (
            // ADDED: Wrapper div with staggered animation
            <div 
                key={child.id} 
                className="opacity-0 animate-fade-in-up" 
                style={{ animationDelay: `${index * 0.03}s` }}
            >
                <TreeItem 
                    node={child} 
                    depth={depth + 1} 
                    expanded={expanded} 
                    toggle={toggle} 
                    selectedId={selectedId} 
                    onSelect={onSelect} 
                    parentPath={myPath} 
                />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderSidebar() {
  const router = useRouter();
  const params = useSearchParams();
  const { currentRepo } = useRepo(); 

  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "ROOT": true }); 
  const [searchTerm, setSearchTerm] = useState("");
  
  const currentPath = params.get("path");
  const currentId = currentPath ? currentPath.split("/").pop() : undefined;

  // FETCH TREE
  useEffect(() => {
    async function fetchTree() {
        if (!currentRepo) return;
        setLoading(true);
        setExpanded({ "ROOT": true }); 
        
        try {
            const res = await fetch(`/api/git/tree?owner=${currentRepo.owner}&repo=${currentRepo.name}`);
            if (res.ok) {
                const data = await res.json();
                const builtTree = buildTreeFromPaths(data.tree);
                
                const rootNode: TreeNode = {
                    id: "ROOT",
                    name: currentRepo.name, 
                    children: builtTree,
                    isRoot: true
                };
                
                setTreeData([rootNode]);
            }
        } catch (error) {
            console.error("Failed to load folder structure", error);
        } finally {
            setLoading(false);
        }
    }
    fetchTree();
  }, [currentRepo]);

  const filteredTree = useMemo(() => {
    return filterTree(treeData, searchTerm);
  }, [treeData, searchTerm]);

  // Auto-expand on navigate
  useEffect(() => {
    if (currentPath) {
      const parts = currentPath.split("/"); 
      setExpanded(prev => {
        const next: Record<string, boolean> = { ...prev, "ROOT": true };
        
        let accum = "";
        parts.forEach((part, i) => {
           accum += (i === 0 ? "" : "/") + part;
           next[accum] = true;
        });
        return next;
      });
    }
  }, [currentPath]);

  const toggle = (id: string) => setExpanded((m) => ({ ...m, [id]: !m[id] }));
  
  const onSelect = (node: TreeNode, fullPath: string) => {
    const qp = new URLSearchParams(params.toString());
    if (fullPath === "") {
        qp.delete("path"); // Root = no path param
    } else {
        qp.set("path", fullPath);
    }
    router.push(`/?${qp.toString()}`);
  };

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-default bg-sidebar md:flex">
      <div className="p-4 border-b border-default mb-2">
        <div className="flex items-center justify-between">
           <div className="text-sm font-semibold text-gray-200">Directories</div>
        </div>
        
        <div className="mt-3 relative group">
            <input 
              type="text" 
              placeholder="Filter folders..." 
              className="input-base pl-10 text-xs bg-card border-default" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-500 group-focus-within:text-blue-400"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
        </div>
      </div>
      
      {/* Container with key to restart animation on repo change */}
      <div 
        key={currentRepo?.id}
        className="flex-1 overflow-y-auto px-2"
      >
        {loading ? (
            // CHANGED: Use LoadingSpinner here
            <LoadingSpinner text="Loading structure..." />
        ) : filteredTree.length > 0 ? (
          filteredTree.map((n, i) => (
            <div 
                key={n.id} 
                className="opacity-0 animate-fade-in-up" 
                style={{ animationDelay: `${i * 0.05}s` }}
            >
                <TreeItem 
                    node={n} 
                    depth={0} 
                    expanded={expanded} 
                    toggle={toggle} 
                    selectedId={currentId} 
                    onSelect={onSelect} 
                    parentPath="" 
                />
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-500 text-center py-4">
             {currentRepo ? "No folders found" : "Select a repository"}
          </div>
        )}
      </div>
    </aside>
  );
}