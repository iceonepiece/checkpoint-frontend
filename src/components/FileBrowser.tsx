"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button, Card } from "@/components/ui";
import { Icon } from "@/components/Icon"; 
import { type FileItem } from "@/lib/mockFiles"; 
import { MOCK_TREE, type TreeNode } from "@/lib/mockFolderTree";
import { useRepo } from "@/lib/RepoContext";

import { AssetCard } from "./file-browser/AssetCard";
import { AssetRow } from "./file-browser/AssetRow";
import { FolderCard } from "./file-browser/FolderCard";
import { SelectionBar } from "./file-browser/SelectionBar";
import { UploadModal } from "./file-browser/modals/UploadModal";
import { DeleteModal } from "./file-browser/modals/DeleteModal";
import { MoveModal } from "./file-browser/modals/MoveModal";

type ViewMode = "grid" | "list";

// --- UTILITIES ---
function getFileType(fileName: string, type: string) {
  if (type === "dir") return "folder";
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return "image/" + ext;
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return "video/" + ext;
  if (['pdf'].includes(ext || '')) return "application/pdf";
  if (['fbx', 'obj', 'blend', 'glb', 'gltf'].includes(ext || '')) return "model/" + ext;
  return "file";
}

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

function getBreadcrumbs(pathStr: string, tree: TreeNode[]) {
  const rootCrumb = { label: "Root", href: "/" };
  if (!pathStr) return [{ label: "Root" }];
  const ids = pathStr.split("/");
  const pathCrumbs = ids.map((id, index) => {
    const node = findNode(tree, id);
    const label = node ? node.name : id;
    const hrefPath = ids.slice(0, index + 1).join("/");
    return { label, href: `/?path=${hrefPath}` };
  });
  return [rootCrumb, ...pathCrumbs];
}

/* ---------- MAIN COMPONENT ---------- */
export default function FileBrowser() {
  const router = useRouter(); 
  const [view, setView] = useState<ViewMode>("grid");
  const { currentRepo } = useRepo();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isMoveOpen, setMoveOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const currentPath = searchParams.get("path") || "";

  // 1. Fetch Files from GitHub API
  const fetchFiles = useCallback(async () => {
    if (!currentRepo) return;

    setLoading(true);
    setError("");
    try {
      const endpoint = currentPath 
        ? `/api/contents/${currentRepo.owner}/${currentRepo.name}?path=${currentPath}`
        : `/api/contents/${currentRepo.owner}/${currentRepo.name}`;

      const res = await fetch(endpoint);
      
      // Handle 404 gracefully (happens during repo switch)
      if (res.status === 404) {
        console.warn("Path not found in this repo, redirecting to root...");
        setFiles([]); 
        setLoading(false);
        router.push("/"); 
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch repository contents");
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const mappedFiles: FileItem[] = data.map((item: any) => {
          const type = getFileType(item.name, item.type);
          return {
            id: item.sha,
            name: item.name,
            type: type,
            sizeBytes: item.size,
            modifiedAt: new Date().toISOString(), 
            isFolder: item.type === "dir",
            path: item.path,
            thumb: item.download_url
          };
        });
        setFiles(mappedFiles);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error(err);
      setError("Could not load repository contents.");
    } finally {
      setLoading(false);
    }
  }, [currentPath, currentRepo, router]);

  useEffect(() => {
    fetchFiles();
    setSelected({});
  }, [fetchFiles]);

  const subFolders = files.filter(f => f.isFolder);
  const currentFiles = files.filter(f => !f.isFolder);

  const toggleOne = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const clearSelection = () => setSelected({});

  // --- HANDLERS ---

  // NEW: Robust Download Handler
  const handleDownload = async () => {
    const selectedIds = Object.keys(selected).filter(k => selected[k]);
    const itemsToDownload = files.filter(item => selectedIds.includes(item.id));
    
    const validItems = itemsToDownload.filter(i => !i.isFolder && i.thumb);

    if (validItems.length === 0) {
       // Optional: Notify user if they tried to download folders or broken files
       return;
    }

    // Process downloads sequentially to prevent browser blocking
    for (const item of validItems) {
        try {
            // 1. Fetch the file as a Blob
            const response = await fetch(item.thumb!);
            if (!response.ok) throw new Error("Network response was not ok");
            
            const blob = await response.blob();
            
            // 2. Create a temporary URL
            const url = window.URL.createObjectURL(blob);
            
            // 3. Trigger download via hidden anchor tag
            const link = document.createElement("a");
            link.href = url;
            link.download = item.name; // This forces the "Save As" behavior with correct name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 4. Cleanup
            window.URL.revokeObjectURL(url);
            
        } catch (err) {
            console.error(`Failed to download ${item.name}`, err);
            // Fallback: If Blob fetch fails (e.g. CORS), open in new tab
            if (item.thumb) window.open(item.thumb, '_blank');
        }
    }
    clearSelection();
  };

  const handleDelete = async (message: string) => {
    alert("Delete logic here");
    setDeleteOpen(false);
    clearSelection();
  };
  const handleMove = async (targetId: string, message: string) => {
    alert("Move logic here");
    setMoveOpen(false);
    clearSelection();
  };
  const handleLock = () => {
    alert("Locking logic here");
    clearSelection();
  };
  const handleUpload = async (file: File, message: string, description: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", message);
    await fetch("/api/upload", { method: "POST", body: formData });
    fetchFiles();
  };

  if (!currentRepo) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-gray-500">
              <Icon className="size-12 mb-4 opacity-50"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></Icon>
              <p className="text-lg font-medium text-gray-400">No repository selected</p>
              <p className="text-sm">Please select a repository from the top menu to view files.</p>
          </div>
      );
  }

  // --- Animation Helper ---
  const getDelayStyle = (index: number) => ({
    animationDelay: `${index * 0.05}s`
  });

  return (
    <div className="flex-1 flex flex-col p-6 min-h-0 overflow-y-auto">
      {/* Header */}
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

      {/* Grid / List with STAGGERED Animation */}
      {loading ? (
         <div className="flex justify-center py-20 text-gray-500">Loading contents...</div>
      ) : error ? (
         <div className="flex justify-center py-20 text-red-400">{error}</div>
      ) : subFolders.length === 0 && currentFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Icon className="size-12 mb-2 opacity-20"><path d="M3 7h5l2 2h11v10H3z"/></Icon>
              <p>This folder is empty</p>
          </div>
      ) : view === "grid" ? (
        <div 
            key={currentPath}
            className="space-y-6 pb-20"
        >
          {/* SECTION: FOLDERS */}
          {subFolders.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Folders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {subFolders.map((f: any, i) => (
                  <div key={f.id} className="opacity-0 animate-fade-in-up" style={getDelayStyle(i)}>
                    <FolderCard file={f} selected={!!selected[f.id]} onToggle={() => toggleOne(f.id)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: FILES */}
          {currentFiles.length > 0 && (
            <div>
              {subFolders.length > 0 && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Files</h3>}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {currentFiles.map((f: any, i) => (
                  <div key={f.id} className="opacity-0 animate-fade-in-up" style={getDelayStyle(subFolders.length + i)}>
                    <AssetCard file={f} selected={!!selected[f.id]} onToggle={() => toggleOne(f.id)} size="cozy" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card 
            key={currentPath}
            className="flex flex-col"
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)_140px_120px_100px_40px] gap-3 px-4 py-3 border-b border-default text-xs font-semibold text-gray-400 uppercase tracking-wider">
             <span className="w-4" />
             <span>Name</span>
             <span className="hidden sm:block">Type</span>
             <span className="hidden md:block">Modified</span>
             <span className="hidden sm:block">Size</span>
          </div>
          <div>
            {[...subFolders, ...currentFiles].map((f: any, i) => (
              <div key={f.id} className="opacity-0 animate-fade-in-up" style={getDelayStyle(i)}>
                <AssetRow file={f} selected={!!selected[f.id]} onToggle={() => toggleOne(f.id)} />
              </div>
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