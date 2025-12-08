"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Asset } from "@/lib/mockAssets"; 
import AssetPreview from "@/components/AssetPreview";
import DiffViewer from "@/components/DiffViewer";
import ReviewPanel from "@/components/ReviewPanel";
import { Card, KeyRow, SectionTitle, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import Link from "next/link";
import { useRepo } from "@/lib/RepoContext";

type Params = { params: Promise<{ id: string }> };

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
  const fileName = filePath.split("/").pop() || "Unknown";

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for Version Compare
  const [compareMode, setCompareMode] = useState(false);
  const [targetVersionId, setTargetVersionId] = useState<string>("");

  useEffect(() => {
    async function loadAssetData() {
        if (!currentRepo) return;
        setLoading(true);
        try {
            // 1. Fetch Current Content
            const resContent = await fetch(`/api/contents/${currentRepo.owner}/${currentRepo.name}?path=${filePath}`);
            if (!resContent.ok) throw new Error("File not found");
            const contentData = await resContent.json();

            // 2. Fetch Versions from NEW Endpoint
            const resVersions = await fetch(`/api/contents/${currentRepo.owner}/${currentRepo.name}/versions?path=${filePath}`);
            const versionData = await resVersions.json();

            // Map API response to our Asset structure
            // Assuming the API returns an array of file objects from history
            const mappedVersions = Array.isArray(versionData) ? versionData.map((v: any) => ({
                id: v.sha,
                // The API endpoint seems to return file objects, we might need to fetch commit info separately 
                // or rely on what's available. For now, using SHA as label if message is missing.
                label: v.commit?.message || `Commit ${v.sha.substring(0, 7)}`, 
                date: v.commit?.author?.date || new Date().toISOString(),
                author: v.commit?.author?.name || "Unknown",
                thumb: v.download_url,
                sizeBytes: v.size
            })) : [];

            // 3. Construct Asset Object
            setAsset({
                id: contentData.sha,
                name: contentData.name,
                type: getFileType(contentData.name),
                sizeBytes: contentData.size,
                modifiedAt: mappedVersions[0]?.date || new Date().toISOString(), 
                thumb: contentData.download_url,
                versions: mappedVersions, 
                status: "Pending",
                comments: [],      
                lockedBy: undefined 
            });
            
            // Default target version for diff is the previous one (if exists)
            if (mappedVersions.length > 1) {
                setTargetVersionId(mappedVersions[1].id);
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    loadAssetData();
  }, [currentRepo, filePath]);

  // --- Handlers ---
  const handleStatusChange = (newStatus: "Needs changes" | "Pending" | "Approved") => {
      if(asset) setAsset({ ...asset, status: newStatus });
  };

  const handleAddComment = (text: string) => {
      if(!asset) return;
      const newComment = { id: `c_${Date.now()}`, user: "Me", text: text, date: "Just now" };
      setAsset({ ...asset, comments: [...asset.comments, newComment] });
  };

  const handleLock = () => {
    if(asset) setAsset({ ...asset, lockedBy: asset.lockedBy ? undefined : "Me" });
  };

  const handleDownload = () => {
    if(!asset?.thumb) return;
    const link = document.createElement("a");
    link.href = asset.thumb;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentRepo) return <div className="p-10 text-gray-500">Loading repository context...</div>;
  if (loading) return <div className="p-10 text-gray-500">Loading asset details...</div>;
  if (error || !asset) return <div className="p-10 text-red-400">Error: {error}</div>;

  // Find the selected "Old" version for Diff
  const targetVersionObj = asset.versions.find(v => v.id === targetVersionId);
  const oldThumb = (targetVersionObj as any)?.thumb || "";

  return (
    <section className="h-full w-full overflow-y-auto">
      <div className="space-y-6 px-6 py-6 max-w-screen-xl mx-auto">
        
        {/* Header */}
        <Card className="p-4 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} title="Go Back">
                <Icon className="size-5"><path d="M19 12H5m7 7l-7-7 7-7" /></Icon>
                </Button>

                <div>
                    <h1 className="text-xl font-semibold text-gray-100">{asset.name}</h1>
                    <div className="text-sm text-gray-400">
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
                <Button size="sm" onClick={handleDownload}>Download</Button>
                <Button size="sm" onClick={handleLock}>
                    {asset.lockedBy ? "Unlock" : "Lock"}
                </Button>
                <Button 
                    size="sm" 
                    variant={compareMode ? "primary" : "default"}
                    onClick={() => setCompareMode(!compareMode)}
                    disabled={asset.versions.length < 2}
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

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 pb-10">
            <div className="flex flex-col gap-4">
                <Card className="p-3 bg-background flex flex-col justify-center">
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
                    <Card className="p-3">
                    <SectionTitle>Metadata</SectionTitle>
                    <div className="mt-2 divide-y divide-default">
                        <KeyRow k="Type" v={asset.type} />
                        <KeyRow k="Size" v={`${(asset.sizeBytes / 1024).toFixed(1)} KB`} />
                        <KeyRow k="Modified" v={new Date(asset.modifiedAt).toLocaleString()} />
                        <KeyRow k="Status" v={asset.status} />
                    </div>
                    </Card>

                    <Card className="p-3">
                    <SectionTitle>Versions</SectionTitle>
                    <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {asset.versions.map((v) => (
                        <li key={v.id} className="flex items-center justify-between rounded-md border border-default bg-background px-3 py-2 text-sm text-gray-200">
                            <div className="flex flex-col min-w-0">
                                <span className="font-medium truncate" title={v.label}>{v.label}</span>
                                {/* Safe check for id and author */}
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
                        ))}
                        {asset.versions.length === 0 && <div className="text-gray-500 text-xs">No history found.</div>}
                    </ul>
                    </Card>
                </div>
            </div>

            <div>
                <ReviewPanel 
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