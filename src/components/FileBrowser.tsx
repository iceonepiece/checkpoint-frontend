"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button, Card } from "@/components/ui";
import { Icon } from "@/components/Icon"; 
import { MOCK_FILES, type FileItem } from "@/lib/mockFiles";
import { MOCK_TREE, type TreeNode } from "@/lib/mockFolderTree";

// IMPORTS: file-browser components
import { AssetCard } from "./file-browser/AssetCard";
import { AssetRow } from "./file-browser/AssetRow";
import { FolderCard } from "./file-browser/FolderCard";
import { SelectionBar } from "./file-browser/SelectionBar";
import { UploadModal } from "./file-browser/modals/UploadModal";
import { DeleteModal } from "./file-browser/modals/DeleteModal";
import { MoveModal } from "./file-browser/modals/MoveModal";

type ViewMode = "grid" | "list";

/* ---------- UTILITIES ---------- */
function findNode(nodes: TreeNode[], id: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function getInitialFolderLocks(nodes: TreeNode[]) {
  let locks: Record<string, { lockedBy: string; lockedAt: string }> = {};
  function traverse(list: TreeNode[]) {
    list.forEach(node => {
      if (node.lockedBy) {
        locks[node.id] = { lockedBy: node.lockedBy, lockedAt: node.lockedAt || "" };
      }
      if (node.children) traverse(node.children);
    });
  }
  traverse(nodes);
  return locks;
}

function getBreadcrumbs(pathStr: string, tree: TreeNode[]) {
  if (!pathStr) return [{ label: "Root" }];
  const ids = pathStr.split("/");
  return ids.map((id, index) => {
    const node = findNode(tree, id);
    const label = node ? node.name : id;
    const hrefPath = ids.slice(0, index + 1).join("/");
    return { label, href: `/?path=${hrefPath}` };
  });
}

/* ---------- MAIN COMPONENT ---------- */
export default function FileBrowser() {
  const [view, setView] = useState<ViewMode>("grid");
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const [folderLocks, setFolderLocks] = useState<Record<string, { lockedBy: string; lockedAt: string }>>(
    getInitialFolderLocks(MOCK_TREE)
  );
  
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  
  // Modal States
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isMoveOpen, setMoveOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const currentPath = searchParams.get("path") || "assets"; 
  const currentFolderId = currentPath.split("/").pop() || "assets";

  // Clear selection whenever the path changes
  useEffect(() => {
    setSelected({});
  }, [currentPath]);

  // Get Subfolders
  const folderNode = findNode(MOCK_TREE, currentFolderId);
  const subFolders = folderNode?.children?.map(child => {
      const lockData = folderLocks[child.id];
      return {
        id: child.id,
        name: child.name,
        type: "folder",
        sizeBytes: 0,
        modifiedAt: new Date().toISOString(),
        isFolder: true,
        path: currentPath ? `${currentPath}/${child.id}` : child.id,
        lockedBy: lockData?.lockedBy,
        lockedAt: lockData?.lockedAt,
        thumb: undefined
      };
  }) || [];

  // Get Files
  const currentFiles = files.filter(f => f.folderId === currentFolderId).map(f => ({
      ...f,
      currentPath: currentPath 
  }));

  const displayItems = [...subFolders, ...currentFiles];

  const toggleOne = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const clearSelection = () => setSelected({});

  // Handlers (Delete, Move, Download, Lock, Upload)
  const handleDelete = (message: string) => {
    const selectedIds = Object.keys(selected).filter(k => selected[k]);
    setFiles(prev => prev.filter(f => !selectedIds.includes(f.id))); 
    clearSelection();
  };

  const handleMove = (targetFolderId: string, message: string) => {
    const selectedIds = Object.keys(selected).filter(k => selected[k]);
    setFiles(prev => prev.map(f => {
        if (selectedIds.includes(f.id)) return { ...f, folderId: targetFolderId };
        return f;
    }));
    clearSelection();
  };

  const handleDownload = () => {
    const selectedIds = Object.keys(selected).filter(k => selected[k]);
    const itemsToDownload = displayItems.filter(item => selectedIds.includes(item.id));
    itemsToDownload.forEach(item => {
        if (item.isFolder) { alert(`Cannot download folder "${item.name}"`); return; }
        const link = document.createElement("a");
        if (item.thumb?.startsWith("blob:") || item.thumb?.startsWith("/")) {
             link.href = item.thumb;
        } else {
             const dummyContent = `Content for ${item.name}.\nSize: ${item.sizeBytes}\nPath: ${item.path}`;
             const blob = new Blob([dummyContent], { type: "text/plain" });
             link.href = URL.createObjectURL(blob);
        }
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    clearSelection();
  };

  const handleLock = () => {
    const selectedIds = Object.keys(selected).filter(k => selected[k]);
    setFiles(prev => prev.map(f => {
      if (selectedIds.includes(f.id)) {
        const isLocked = !!f.lockedBy;
        return { ...f, lockedBy: isLocked ? undefined : "Me", lockedAt: isLocked ? undefined : new Date().toISOString() };
      }
      return f;
    }));

    const visibleFolderIds = subFolders.map(f => f.id);
    const targetFolders = selectedIds.filter(id => visibleFolderIds.includes(id));
    
    if (targetFolders.length > 0) {
        setFolderLocks(prev => {
            const next = { ...prev };
            targetFolders.forEach(id => {
                if (next[id]) delete next[id];
                else next[id] = { lockedBy: "Me", lockedAt: new Date().toISOString() };
            });
            return next;
        });
    }
    clearSelection();
  };

  const handleUpload = async (file: File, message: string, description: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newFile: FileItem = {
      id: `new_${Date.now()}`,
      name: file.name,
      type: file.type || "unknown",
      sizeBytes: file.size,
      modifiedAt: new Date().toISOString(),
      thumb: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      isFolder: false,
      path: currentPath ? `${currentPath}/${file.name}` : file.name,
      folderId: currentFolderId,
    };
    setFiles((prev) => [...prev, newFile]);
  };

  return (
    <div className="flex-1 flex flex-col p-6 min-h-0 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Breadcrumbs items={getBreadcrumbs(currentPath, MOCK_TREE)} />
        
        <div className="flex items-center gap-2">
           <div className="flex items-center rounded-md border border-default bg-background p-1">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "bg-card-hover text-white" : "text-gray-400 hover:text-white"}`}>
               <Icon className="size-4"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></Icon>
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === "list" ? "bg-card-hover text-white" : "text-gray-400 hover:text-white"}`}>
               <Icon className="size-4"><path d="M8 6h12M4 6h1M8 12h12M4 12h1M8 18h12M4 18h1" /></Icon>
            </button>
           </div>
           <Button variant="primary" onClick={() => setUploadOpen(true)}>
             <Icon className="size-4 mr-2"><path d="M12 5v14M5 12h14" /></Icon>
             Upload
           </Button>
        </div>
      </div>

      <SelectionBar 
        count={Object.values(selected).filter(Boolean).length} 
        onLock={handleLock}
        onDelete={() => setDeleteOpen(true)}
        onMove={() => setMoveOpen(true)}
        onDownload={handleDownload}
        clear={clearSelection} 
      />

      {/* Grid / List */}
      {subFolders.length === 0 && currentFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Icon className="size-12 mb-2 opacity-20"><path d="M3 7h5l2 2h11v10H3z"/></Icon>
              <p>This folder is empty</p>
          </div>
      ) : view === "grid" ? (
        <div className="space-y-6 pb-20">
          
          {/* SECTION: FOLDERS */}
          {subFolders.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Folders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {subFolders.map((f: any) => (
                  <FolderCard key={f.id} file={f} selected={!!selected[f.id]} onToggle={() => toggleOne(f.id)} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION: FILES */}
          {currentFiles.length > 0 && (
            <div>
              {subFolders.length > 0 && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Files</h3>}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {currentFiles.map((f: any) => (
                  <AssetCard key={f.id} file={f} selected={!!selected[f.id]} onToggle={() => toggleOne(f.id)} size="cozy" />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="flex flex-col">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_140px_120px_100px_40px] gap-3 px-4 py-3 border-b border-default text-xs font-semibold text-gray-400 uppercase tracking-wider">
             <span className="w-4" />
             <span>Name</span>
             <span className="hidden sm:block">Type</span>
             <span className="hidden md:block">Modified</span>
             <span className="hidden sm:block">Size</span>
          </div>
          <div>
            {[...subFolders, ...currentFiles].map((f: any) => (
              <AssetRow key={f.id} file={f} selected={!!selected[f.id]} onToggle={() => toggleOne(f.id)} />
            ))}
          </div>
        </Card>
      )}
      
      {/* MODALS */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} currentPath={currentPath} existingFiles={files} onUpload={handleUpload} />
      <DeleteModal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} selectedCount={Object.values(selected).filter(Boolean).length} onConfirm={handleDelete} />
      <MoveModal isOpen={isMoveOpen} onClose={() => setMoveOpen(false)} selectedCount={Object.values(selected).filter(Boolean).length} onConfirm={handleMove} />
    </div>
  );
}