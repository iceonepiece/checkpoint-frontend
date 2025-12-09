"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Asset, AssetVersion } from "@/lib/mockAssets"; 
import AssetPreview from "@/components/AssetPreview";
import DiffViewer from "@/components/DiffViewer";
import ReviewPanel from "@/components/ReviewPanel";
// Import UploadModal
import { UploadModal } from "@/components/file-browser/modals/UploadModal";
import { Card, KeyRow, SectionTitle, Button, LoadingSpinner } from "@/components/ui";
import { Icon } from "@/components/Icon";
import Link from "next/link";
import { useRepo } from "@/lib/RepoContext";

type Params = { params: Promise<{ id: string }> };

// --- Interfaces for API Responses ---
interface ApiComment {
  comment_id: string;
  user: {
    username: string;
    avatar_url: string;
  } | null;
  message: string;
  created_at: string;
}

interface ApiVersion {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
      name: string;
      email: string;
    };
    committer: {
        date: string;
    };
  };
  download_url: string;
  size: number;
}

interface ApiLockEvent {
    is_locked: boolean;
    created_at: string;
    user: {
        username: string;
    } | null;
}

const STATUS_MAP: Record<number, "Pending" | "Approved" | "Needs changes"> = {
  0: "Pending",
  1: "Approved",
  2: "Needs changes"
};

function getFileType(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return "image/" + ext;
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return "video/" + ext;
  if (['pdf'].includes(ext || '')) return "application/pdf";
  if (['fbx', 'obj', 'blend', 'glb', 'gltf'].includes(ext || '')) return "model/" + ext;
  return "file";
}

// Helper for consistent date formatting
function formatDate(dateStr: string) {
  if (!dateStr) return "Just now";
  return new Date(dateStr).toLocaleString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default function AssetPage(props: Params) {
  const router = useRouter();
  
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    props.params.then(setResolvedParams);
  }, [props.params]);

  const { currentRepo, user } = useRepo();

  const filePath = resolvedParams ? decodeURIComponent(resolvedParams.id) : "";
  const parentPath = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : "";
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [fileId, setFileId] = useState<number | null>(null); 
  
  const [mainLoading, setMainLoading] = useState(true); 
  const [infoLoading, setInfoLoading] = useState(true); 
  const [versionsLoading, setVersionsLoading] = useState(true); 
  const [isDownloading, setIsDownloading] = useState(false); 
  
  const [isLocking, setIsLocking] = useState(false);
  const [isUpdateOpen, setUpdateOpen] = useState(false); 
  
  const [isExiting, setIsExiting] = useState(false);

  const [error, setError] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [targetVersionId, setTargetVersionId] = useState<string>("");

  useEffect(() => {
    if (!resolvedParams) return;
    let isMounted = true;

    async function loadData() {
        if (!currentRepo) return;

        if (asset) {
            setIsExiting(true);
            await new Promise(resolve => setTimeout(resolve, 300)); 
            if (!isMounted) return;
            setAsset(null); 
            setIsExiting(false); 
        }

        setMainLoading(true);
        setError("");

        const baseUrl = `/api/contents/${currentRepo.owner}/${currentRepo.name}`;

        try {
            const resMeta = await fetch(`${baseUrl}?path=${encodeURIComponent(filePath)}`);
            if (resMeta.status === 404) {
                if (isMounted) {
                    setError("File not found in this repository");
                    setMainLoading(false);
                }
                return;
            }
            if (!resMeta.ok) throw new Error("Failed to fetch file metadata");
            const metaData = await resMeta.json();

            const initialAsset: Asset = {
                id: metaData.sha,
                name: metaData.name,
                type: getFileType(metaData.name),
                sizeBytes: metaData.size,
                modifiedAt: new Date().toISOString(), 
                thumb: metaData.download_url,
                versions: [],
                status: "Pending", 
                comments: [],      
                lockedBy: undefined 
            };

            if (isMounted) {
                setAsset(initialAsset);
                setMainLoading(false); 
                setInfoLoading(true);
                setVersionsLoading(true);
            }

            fetch(`${baseUrl}/info?path=${encodeURIComponent(filePath)}`)
                .then(async (res) => {
                    if (res.ok) {
                        const data = await res.json();
                        if (!isMounted) return;

                        if (data.file_id) setFileId(data.file_id);

                        const statusInt = (data.asset_status as number) ?? 0;
                        const statusStr = STATUS_MAP[statusInt] || "Pending";

                        const dbComments = data.comments?.map((c: ApiComment) => ({
                            id: c.comment_id,
                            user: c.user?.username || "Unknown", 
                            avatarUrl: c.user?.avatar_url,
                            text: c.message,
                            date: formatDate(c.created_at)
                        })) || [];

                        const locks = data.lock_events as ApiLockEvent[] | undefined;
                        const latestLock = locks?.[0];
                        const isLocked = latestLock?.is_locked ?? false;
                        const lockedBy = isLocked ? (latestLock?.user?.username ?? "Unknown") : undefined;

                        setAsset(prev => prev ? { 
                            ...prev, 
                            status: statusStr, 
                            comments: dbComments,
                            lockedBy: lockedBy 
                        } : null);
                    }
                })
                .catch((err) => console.warn("Info fetch failed", err))
                .finally(() => isMounted && setInfoLoading(false));

            fetch(`${baseUrl}/versions?path=${encodeURIComponent(filePath)}`)
                .then(async (res) => {
                    if (res.ok) {
                        const versionData = await res.json();
                        if (!isMounted) return;

                        const mappedVersions: AssetVersion[] = Array.isArray(versionData) 
                          ? versionData.map((v: ApiVersion) => ({
                              id: v.sha,
                              label: v.commit?.message || `Commit ${v.sha.substring(0, 7)}`, 
                              date: v.commit?.author?.date || new Date().toISOString(),
                              author: v.commit?.author?.name || "Unknown",
                              thumb: v.download_url,
                              sizeBytes: v.size
                          })) 
                          : [];

                        setAsset(prev => {
                            if (!prev) return null;
                            return {
                                ...prev,
                                versions: mappedVersions,
                                modifiedAt: mappedVersions[0]?.date || prev.modifiedAt, 
                            };
                        });

                        if (mappedVersions.length > 1) {
                            setTargetVersionId(mappedVersions[1].id);
                        }
                    }
                })
                .catch(console.error)
                .finally(() => isMounted && setVersionsLoading(false));

        } catch (err: unknown) {
            if (isMounted) {
                console.error(err);
                setError((err instanceof Error) ? err.message : "An error occurred");
                setMainLoading(false);
            }
        }
    }

    loadData();
    return () => { isMounted = false; };
  }, [currentRepo, filePath, resolvedParams]);

  // --- PERMISSION CHECKS ---
  const isRepoOwner = currentRepo?.owner === user?.username;
  const isLockedByMe = asset?.lockedBy === user?.username;
  const canModify = !asset?.lockedBy || isLockedByMe; 
  const canUnlock = isLockedByMe || isRepoOwner || !asset?.lockedBy; 

  const handleStatusChange = async (newStatus: "Needs changes" | "Pending" | "Approved") => {
      if(!asset || !currentRepo) return;
      
      if (!canModify) {
          alert(`Cannot change status: File is locked by ${asset.lockedBy}`);
          return;
      }

      setAsset({ ...asset, status: newStatus }); 

      try {
        const res = await fetch(`/api/contents/${currentRepo.owner}/${currentRepo.name}/info`, {
            method: "PUT",
            body: JSON.stringify({ path: filePath, status: newStatus })
        });
        
        if (res.ok && !fileId) {
             const resInfo = await fetch(`/api/contents/${currentRepo.owner}/${currentRepo.name}/info?path=${encodeURIComponent(filePath)}`);
             if (resInfo.ok) {
                 const data = await resInfo.json();
                 if (data.file_id) setFileId(data.file_id);
             }
        }
      } catch (err) {
        console.error("Status update failed", err);
      }
  };

  const handleAddComment = async (text: string) => {
      if(!asset || !currentRepo) return;
      let currentFileId = fileId;

      if (!currentFileId) {
          try {
              const resCreate = await fetch(`/api/contents/${currentRepo.owner}/${currentRepo.name}/info`, {
                  method: "PUT",
                  body: JSON.stringify({ path: filePath, status: asset.status })
              });
              if (resCreate.ok) {
                  const resInfo = await fetch(`/api/contents/${currentRepo.owner}/${currentRepo.name}/info?path=${encodeURIComponent(filePath)}`);
                  const data = await resInfo.json();
                  currentFileId = data.file_id;
                  setFileId(currentFileId);
              }
          } catch { return; }
      }

      if (!currentFileId) return;

      try {
        const res = await fetch(`/api/comments/${currentRepo.owner}/${currentRepo.name}`, {
            method: "POST",
            body: JSON.stringify({ file_id: currentFileId, message: text })
        });
        if (res.ok) {
            const { comment } = await res.json();
            const newComment = { 
                id: comment.comment_id, 
                user: user?.username || "Unknown", 
                avatarUrl: user?.avatar_url,
                text: comment.message, 
                date: formatDate(comment.created_at) 
            };
            setAsset({ ...asset, comments: [...asset.comments, newComment] });
        }
      } catch (err) {
        console.error("Comment failed", err);
      }
  };

  const handleLock = async () => {
    if(!asset || !currentRepo) return;
    if (asset.lockedBy && !canUnlock) return;

    setIsLocking(true);
    try {
        const shouldLock = !asset.lockedBy;
        const url = `/api/contents/${currentRepo.owner}/${currentRepo.name}/lock?path=${encodeURIComponent(filePath)}&is_locked=${shouldLock}`;
        const res = await fetch(url, { method: "POST" });
        if (!res.ok) throw new Error("Failed to toggle lock");

        const resInfo = await fetch(`/api/contents/${currentRepo.owner}/${currentRepo.name}/info?path=${encodeURIComponent(filePath)}`);
        if (resInfo.ok) {
             const data = await resInfo.json();
             const locks = data.lock_events as ApiLockEvent[] | undefined;
             const latestLock = locks?.[0];
             const isLocked = latestLock?.is_locked ?? false;
             const lockedBy = isLocked ? (latestLock?.user?.username ?? "Unknown") : undefined;
             setAsset(prev => prev ? { ...prev, lockedBy } : null);
        }
    } catch (err) {
        console.error("Lock error", err);
    } finally {
        setIsLocking(false);
    }
  };

  const handleDownload = async () => {
    if(!asset?.thumb || !currentRepo) return;
    setIsDownloading(true);
    try {
        const downloadUrl = `/api/download?owner=${currentRepo.owner}&repo=${currentRepo.name}&path=${encodeURIComponent(filePath)}`;
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error("Download failed");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = asset.name; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Download failed", err);
        if (asset.thumb) window.open(asset.thumb, '_blank');
    } finally {
        setIsDownloading(false);
    }
  };

  const handleUpdate = async (files: File[], message: string, description: string) => {
    if (!currentRepo || !asset) return;

    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    formData.append("message", message);
    if (description) formData.append("description", description);

    const uploadUrl = `/api/contents/${currentRepo.owner}/${currentRepo.name}/upload?path=${encodeURIComponent(parentPath)}`;

    try {
        const res = await fetch(uploadUrl, { method: "POST", body: formData });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Update failed");
        }
        window.location.reload(); 
    } catch (err) {
        console.error("Update error:", err);
        alert("Failed to update asset");
    }
  };

  if (!currentRepo) return <div className="p-10 text-gray-500">Loading repository context...</div>;
  if (!resolvedParams || mainLoading) return (
      <div className="flex flex-col items-center justify-center h-full">
          <LoadingSpinner text="Loading asset..." />
      </div>
  );
  
  if (error || !asset) return (
    <div className="flex flex-col items-center justify-center p-10 space-y-4">
        <div className="text-red-400">Error: {error}</div>
        <Button onClick={() => router.push("/")} variant="default">Return to Root</Button>
    </div>
  );

  const targetVersionObj: AssetVersion | undefined = asset.versions.find(v => v.id === targetVersionId);
  const oldThumb = targetVersionObj?.thumb || "";
  const animationClass = isExiting ? "animate-fade-out-left" : "animate-fade-in-right opacity-0";
  const isBusy = isDownloading || isLocking;

  let lockLabel = "Lock";
  if (isLocking) { lockLabel = "Updating..."; } 
  else if (asset.lockedBy) { lockLabel = canUnlock ? "Unlock" : `Locked by ${asset.lockedBy}`; }

  return (
    <section className="h-full w-full overflow-y-auto">
      <div className="space-y-6 px-6 py-6 max-w-screen-xl mx-auto">
        <Card className={`p-4 shrink-0 ${animationClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} title="Go Back">
                <Icon className="size-5"><path d="M19 12H5m7 7l-7-7 7-7" /></Icon>
                </Button>

                <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-gray-100 truncate">{asset.name}</h1>
                    <div className="text-sm text-gray-400 truncate">
                    <Link href="/" className="hover:underline">{currentRepo.fullName}</Link>
                    <span className="mx-1 text-gray-600">/</span>
                    <span className="text-gray-300">{filePath}</span>
                    <span className="mx-1 text-gray-600">•</span>
                    {formatDate(asset.modifiedAt)}
                    
                    {asset.lockedBy && (
                        <>
                        <span className="mx-1 text-gray-600">•</span>
                        <span className="rounded border border-default px-1 text-xs text-red-400 border-red-900/30 bg-red-900/10 flex items-center gap-1 inline-flex">
                            <Icon className="size-3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>
                            Locked by {asset.lockedBy}
                        </span>
                        </>
                    )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    size="sm" 
                    variant="primary"
                    onClick={() => setUpdateOpen(true)}
                    // CHANGED: Added infoLoading
                    disabled={infoLoading || !canModify || isDownloading || isLocking}
                >
                    Update New Version
                </Button>

                <Button size="sm" onClick={handleDownload} loading={isDownloading}>
                    {isDownloading ? "Downloading..." : "Download"}
                </Button>
                
                <Button 
                    size="sm" 
                    onClick={handleLock} 
                    loading={isLocking} 
                    // CHANGED: Added infoLoading
                    disabled={infoLoading || (!!asset.lockedBy && !canUnlock)}
                >
                    {lockLabel}
                </Button>
                
                <Button 
                    size="sm" 
                    variant={compareMode ? "primary" : "default"}
                    onClick={() => setCompareMode(!compareMode)}
                    disabled={versionsLoading || asset.versions.length < 2}
                >
                {compareMode ? "Exit Compare" : "Compare"}
                </Button>
            </div>
            </div>
            
            {compareMode && (
                <div className="mt-4 pt-4 border-t border-default flex items-center gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-400 font-medium">Base:</span>
                        <select 
                            className="bg-background border border-default rounded px-2 py-1 text-gray-200"
                            value={targetVersionId}
                            onChange={(e) => setTargetVersionId(e.target.value)}
                        >
                            {asset.versions.slice(1).map(v => (
                                <option key={v.id} value={v.id}>{v.label} ({formatDate(v.date)})</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-gray-500">vs</div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-400 font-medium">Head:</span>
                        <span className="bg-background border border-default rounded px-2 py-1 text-gray-400 cursor-not-allowed">
                            Current
                        </span>
                    </div>
                </div>
            )}
        </Card>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 pb-10">
            <div className="flex flex-col gap-4">
                <Card 
                    className={`p-3 bg-background flex flex-col justify-center ${animationClass}`}
                    style={{ animationDelay: isExiting ? "0s" : "0.1s" }}
                >
                    {compareMode ? (
                        <DiffViewer 
                            before={oldThumb} 
                            after={asset.thumb!} 
                            type={asset.type} 
                        />
                    ) : (
                        <AssetPreview src={asset.thumb} type={asset.type} alt={asset.name} />
                    )}
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                        className={`p-3 ${animationClass}`}
                        style={{ animationDelay: isExiting ? "0s" : "0.2s" }}
                    >
                        <SectionTitle>Metadata</SectionTitle>
                        <div className="mt-2 divide-y divide-default">
                            <KeyRow k="Type" v={asset.type} />
                            <KeyRow k="Size" v={`${(asset.sizeBytes / 1024).toFixed(1)} KB`} />
                            <KeyRow k="Modified" v={formatDate(asset.modifiedAt)} />
                            <KeyRow k="Status" v={asset.status} />
                        </div>
                    </Card>

                    <Card 
                        className={`p-3 ${animationClass}`}
                        style={{ animationDelay: isExiting ? "0s" : "0.3s" }}
                    >
                        <SectionTitle>Versions</SectionTitle>
                        <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                            {versionsLoading ? (
                                [1,2,3].map(i => (
                                    <li key={i} className="flex flex-col gap-1 p-3 border border-default rounded-md bg-white/5 animate-pulse">
                                        <div className="h-3 w-3/4 bg-white/10 rounded"/>
                                        <div className="h-2 w-1/2 bg-white/10 rounded"/>
                                    </li>
                                ))
                            ) : asset.versions.length === 0 ? (
                                <div className="text-gray-500 text-xs py-4 text-center">No history found.</div>
                            ) : (
                                asset.versions.map((v) => (
                                <li key={v.id} className="flex items-center justify-between rounded-md border border-default bg-background px-3 py-2 text-sm text-gray-200">
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate" title={v.label}>{v.label}</span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(v.date)} • {v.id?.substring(0,7) ?? "—"} • {v.author ?? "Unknown"}
                                        </span>
                                    </div>
                                    {!compareMode && asset.versions.indexOf(v) > 0 && (
                                        <button 
                                            onClick={() => { setCompareMode(true); setTargetVersionId(v.id); }}
                                            className="text-xs border border-default rounded px-2 py-1 hover:bg-white/5 shrink-0 ml-2"
                                        >
                                            Diff
                                        </button>
                                    )}
                                </li>
                                ))
                            )}
                        </ul>
                    </Card>
                </div>
            </div>

            <div 
                className={animationClass}
                style={{ animationDelay: isExiting ? "0s" : "0.4s" }}
            >
                {/* Check infoLoading for read-only panel too if strict consistency needed, but permission logic is safer */}
                <div className={!canModify ? "opacity-70 pointer-events-none grayscale-[0.5]" : ""}>
                    <ReviewPanel 
                        isLoading={infoLoading}
                        status={asset.status} 
                        onStatusChange={handleStatusChange}
                        comments={asset.comments}
                        onAddComment={handleAddComment}
                    />
                </div>
                {!canModify && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-center text-xs text-red-400">
                        <Icon className="size-3 inline mr-1 -mt-0.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></Icon>
                        This file is locked by <strong>{asset.lockedBy}</strong>. You cannot modify it.
                    </div>
                )}
            </div>
        </div>
        
        <UploadModal 
            isOpen={isUpdateOpen} 
            onClose={() => setUpdateOpen(false)} 
            currentPath={parentPath} 
            existingFiles={[]}
            onUpload={handleUpdate}
            fixedFileName={asset.name}
        />

      </div>
    </section>
  );
}