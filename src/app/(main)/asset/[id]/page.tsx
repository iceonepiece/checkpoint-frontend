"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Asset } from "@/lib/mockAssets"; 
import AssetPreview from "@/components/AssetPreview";
import DiffViewer from "@/components/DiffViewer";
import ReviewPanel from "@/components/ReviewPanel";
import { Card, KeyRow, SectionTitle, Button, LoadingSpinner } from "@/components/ui";
import { Icon } from "@/components/Icon";
import Link from "next/link";
import { useRepo } from "@/lib/RepoContext";

type Params = { params: Promise<{ id: string }> };

// Map DB Integers to UI Strings
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

export default function AssetPage(props: Params) {
  const router = useRouter();
  const params = use(props.params);
  const { currentRepo } = useRepo();

  const filePath = decodeURIComponent(params.id);
  
  // Data State
  const [asset, setAsset] = useState<Asset | null>(null);
  const [fileId, setFileId] = useState<number | null>(null); 
  
  // Loading States
  const [mainLoading, setMainLoading] = useState(true); // Blocks entire page (metadata)
  const [infoLoading, setInfoLoading] = useState(true); // Blocks review panel
  const [versionsLoading, setVersionsLoading] = useState(true); // Blocks versions list
  const [isDownloading, setIsDownloading] = useState(false); // Blocks download button
  
  // Animation State
  const [isExiting, setIsExiting] = useState(false);

  // UI State
  const [error, setError] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [targetVersionId, setTargetVersionId] = useState<string>("");

  // --- 1. DATA LOADING EFFECT ---
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
        if (!currentRepo) return;

        // A. Handle Exit Animation (if navigating from another asset)
        if (asset) {
            setIsExiting(true);
            await new Promise(resolve => setTimeout(resolve, 300)); // Wait for CSS animation
            if (!isMounted) return;
            setAsset(null); 
            setIsExiting(false); 
        }

        setMainLoading(true);
        setError("");

        const baseUrl = `/api/contents/${currentRepo.owner}/${currentRepo.name}`;

        try {
            // B. Fetch Critical Metadata (Blocking)
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

            // Initialize Asset with minimal data to render UI immediately
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
                setMainLoading(false); // RENDER THE PAGE
                setInfoLoading(true);
                setVersionsLoading(true);
            }

            // C. Fetch Info (Background) - Status & Comments
            fetch(`${baseUrl}/info?path=${encodeURIComponent(filePath)}`)
                .then(async (res) => {
                    if (res.ok) {
                        const data = await res.json();
                        if (!isMounted) return;

                        if (data.file_id) setFileId(data.file_id);

                        const statusInt = data.asset_status ?? 0;
                        const statusStr = STATUS_MAP[statusInt] || "Pending";

                        const dbComments = data.comments?.map((c: any) => ({
                            id: c.comment_id,
                            user: c.user?.username || "User", 
                            avatarUrl: c.user?.avatar_url,
                            text: c.message,
                            date: new Date(c.created_at).toLocaleDateString()
                        })) || [];

                        setAsset(prev => prev ? { ...prev, status: statusStr, comments: dbComments } : null);
                    }
                })
                .catch(console.warn)
                .finally(() => isMounted && setInfoLoading(false));

            // D. Fetch Versions (Background) - Commit History
            fetch(`${baseUrl}/versions?path=${encodeURIComponent(filePath)}`)
                .then(async (res) => {
                    if (res.ok) {
                        const versionData = await res.json();
                        if (!isMounted) return;

                        const mappedVersions = Array.isArray(versionData) ? versionData.map((v: any) => ({
                            id: v.sha,
                            label: v.commit?.message || `Commit ${v.sha.substring(0, 7)}`, 
                            date: v.commit?.author?.date || new Date().toISOString(),
                            author: v.commit?.author?.name || "Unknown",
                            thumb: v.download_url,
                            sizeBytes: v.size
                        })) : [];

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

        } catch (err: any) {
            if (isMounted) {
                console.error(err);
                setError(err.message);
                setMainLoading(false);
            }
        }
    }

    loadData();
    return () => { isMounted = false; };
  }, [currentRepo, filePath]);

  // --- 2. HANDLERS ---

  const handleStatusChange = async (newStatus: "Needs changes" | "Pending" | "Approved") => {
      if(!asset || !currentRepo) return;
      
      // Optimistic Update
      setAsset({ ...asset, status: newStatus }); 

      try {
        const res = await fetch(`/api/contents/${currentRepo.owner}/${currentRepo.name}/info`, {
            method: "PUT",
            body: JSON.stringify({ path: filePath, status: newStatus })
        });
        
        // If this was the first action (creating file row), grab the new ID
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
      
      // If file not tracked yet, create it implicitly via status update
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
          } catch (e) { return; }
      }

      if (!currentFileId) return;

      try {
        const res = await fetch(`/api/comments/${currentRepo.owner}/${currentRepo.name}`, {
            method: "POST",
            body: JSON.stringify({ file_id: currentFileId, message: text })
        });
        if (res.ok) {
            const { comment } = await res.json();
            // Optimistic Add (User info might be partial until refresh)
            const newComment = { 
                id: comment.comment_id, 
                user: "Me", 
                text: comment.message, 
                date: new Date(comment.created_at).toLocaleDateString() 
            };
            setAsset({ ...asset, comments: [...asset.comments, newComment] });
        }
      } catch (err) {
        console.error("Comment failed", err);
      }
  };

  const handleLock = () => {
    // Placeholder: Local state toggle only for now
    if(asset) setAsset({ ...asset, lockedBy: asset.lockedBy ? undefined : "Me" });
  };

  const handleDownload = async () => {
    if(!asset?.thumb || !currentRepo) return;

    setIsDownloading(true);

    try {
        // Build the proxy URL to bypass CORS/Auth issues
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
        console.error("Download failed, falling back to new tab", err);
        // Fallback
        if (asset.thumb) window.open(asset.thumb, '_blank');
    } finally {
        setIsDownloading(false);
    }
  };

  // --- 3. RENDER ---

  if (!currentRepo) return <div className="p-10 text-gray-500">Loading repository context...</div>;
  
  if (mainLoading) return (
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

  const targetVersionObj = asset.versions.find(v => v.id === targetVersionId);
  const oldThumb = (targetVersionObj as any)?.thumb || "";

  // Dynamic animation class: Slide Out Left OR Slide In Right
  const animationClass = isExiting ? "animate-fade-out-left" : "animate-fade-in-right opacity-0";

  return (
    <section className="h-full w-full overflow-y-auto">
      <div className="space-y-6 px-6 py-6 max-w-screen-xl mx-auto">
        
        {/* HEADER */}
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
                    {new Date(asset.modifiedAt).toLocaleString()}
                    
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
                <Button size="sm" onClick={handleDownload} loading={isDownloading}>
                    {isDownloading ? "Downloading..." : "Download"}
                </Button>
                <Button size="sm" onClick={handleLock} disabled={isDownloading}>
                    {asset.lockedBy ? "Unlock" : "Lock"}
                </Button>
                <Button 
                    size="sm" 
                    variant={compareMode ? "primary" : "default"}
                    onClick={() => setCompareMode(!compareMode)}
                    disabled={versionsLoading || asset.versions.length < 2 || isDownloading}
                >
                {compareMode ? "Exit Compare" : "Compare"}
                </Button>
            </div>
            </div>
            
            {/* Compare Bar */}
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
                                <option key={v.id} value={v.id}>{v.label} ({new Date(v.date).toLocaleDateString()})</option>
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

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 pb-10">
            <div className="flex flex-col gap-4">
                
                {/* PREVIEW (Delay 0.1s) */}
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
                    
                    {/* METADATA (Delay 0.2s) */}
                    <Card 
                        className={`p-3 ${animationClass}`}
                        style={{ animationDelay: isExiting ? "0s" : "0.2s" }}
                    >
                        <SectionTitle>Metadata</SectionTitle>
                        <div className="mt-2 divide-y divide-default">
                            <KeyRow k="Type" v={asset.type} />
                            <KeyRow k="Size" v={`${(asset.sizeBytes / 1024).toFixed(1)} KB`} />
                            <KeyRow k="Modified" v={new Date(asset.modifiedAt).toLocaleString()} />
                            <KeyRow k="Status" v={asset.status} />
                        </div>
                    </Card>

                    {/* VERSIONS (Delay 0.3s) */}
                    <Card 
                        className={`p-3 ${animationClass}`}
                        style={{ animationDelay: isExiting ? "0s" : "0.3s" }}
                    >
                        <SectionTitle>Versions</SectionTitle>
                        <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                            {versionsLoading ? (
                                // Version Skeletons
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
                                            {new Date(v.date).toLocaleDateString()} • {v.id?.substring(0,7) ?? "—"} • {(v as any).author ?? "Unknown"}
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

            {/* REVIEW PANEL (Delay 0.4s) */}
            <div 
                className={animationClass}
                style={{ animationDelay: isExiting ? "0s" : "0.4s" }}
            >
                <ReviewPanel 
                    isLoading={infoLoading}
                    status={asset.status} 
                    onStatusChange={handleStatusChange}
                    comments={asset.comments}
                    onAddComment={handleAddComment}
                />
            </div>
        </div>
      </div>
    </section>
  );
}