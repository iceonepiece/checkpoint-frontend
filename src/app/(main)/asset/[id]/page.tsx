"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { MOCK_ASSETS, type Asset } from "@/lib/mockAssets";
import AssetPreview from "@/components/AssetPreview";
import DiffViewer from "@/components/DiffViewer";
import ReviewPanel from "@/components/ReviewPanel";
import { Card, KeyRow, SectionTitle, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import Link from "next/link";

type Params = { params: Promise<{ id: string }> };

export default function AssetPage(props: Params) {
  const router = useRouter();
  const params = use(props.params);
  const id = params.id;

  const initialAsset = MOCK_ASSETS[id] ?? Object.values(MOCK_ASSETS)[0];
  const [asset, setAsset] = useState<Asset>(initialAsset);
  
  const oldAsset = getOldVersionMock(asset);
  const [compareMode, setCompareMode] = useState(false);
  const [targetVersion, setTargetVersion] = useState(asset.versions[1]?.id || "v1");

  // Handlers for the Review Panel
  const handleStatusChange = (newStatus: "Needs changes" | "Pending" | "Approved") => {
      setAsset(prev => ({ ...prev, status: newStatus }));
  };

  const handleAddComment = (text: string) => {
      const newComment = {
          id: `c_${Date.now()}`,
          user: "Me",
          text: text,
          date: "Just now"
      };
      setAsset(prev => ({
          ...prev,
          comments: [...prev.comments, newComment]
      }));
  };

  const handleLock = () => {
    setAsset((prev) => ({
      ...prev,
      lockedBy: prev.lockedBy ? undefined : "Me",
    }));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    if (asset.thumb?.startsWith("/") || asset.thumb?.startsWith("blob:")) {
        link.href = asset.thumb || "";
    } else {
        const dummyContent = `Content for ${asset.name}.\nSize: ${asset.sizeBytes} bytes.\nType: ${asset.type}`;
        const blob = new Blob([dummyContent], { type: "text/plain" });
        link.href = URL.createObjectURL(blob);
    }
    
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                    <Link href="/" className="hover:underline">Example-User / Example-Repository</Link>
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
                            value={targetVersion}
                            onChange={(e) => setTargetVersion(e.target.value)}
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
            {/* Left: Preview & Meta */}
            <div className="flex flex-col gap-4">
                <Card className="p-3 bg-background flex flex-col justify-center">
                    {compareMode ? (
                        <DiffViewer 
                            before={oldAsset.thumb!} 
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
                        <KeyRow 
                            k="Size" 
                            v={
                                compareMode ? (
                                    <span className="flex items-center gap-2">
                                        <span className="line-through text-gray-500">{ (oldAsset.sizeBytes / 1024 / 1024).toFixed(2) }MB</span>
                                        <span>→</span>
                                        <span className="text-green-400">{(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                                    </span>
                                ) : `${(asset.sizeBytes / (1024 * 1024)).toFixed(2)} MB`
                            } 
                        />
                        <KeyRow k="Modified" v={new Date(asset.modifiedAt).toLocaleString()} />
                        <KeyRow k="Status" v={asset.status} />
                    </div>
                    </Card>

                    <Card className="p-3">
                    <SectionTitle>Versions</SectionTitle>
                    <ul className="mt-2 space-y-2">
                        {asset.versions.map((v) => (
                        <li key={v.id} className="flex items-center justify-between rounded-md border border-default bg-background px-3 py-2 text-sm text-gray-200">
                            <span className={v.id === asset.versions[0].id ? "text-green-400 font-medium" : ""}>
                                {v.label} {v.id === asset.versions[0].id && "(Current)"}
                            </span>
                            <div className="flex items-center gap-2 text-gray-400">
                            <span>{new Date(v.date).toLocaleDateString()}</span>
                            {!compareMode && (
                                <button 
                                    onClick={() => { setCompareMode(true); setTargetVersion(v.id); }}
                                    className="text-xs border border-default rounded px-2 py-1 hover:bg-white/5"
                                >
                                    Diff
                                </button>
                            )}
                            </div>
                        </li>
                        ))}
                    </ul>
                    </Card>
                </div>
            </div>

            {/* Right: Review Panel */}
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

function getOldVersionMock(asset: any) {
    return {
        ...asset,
        sizeBytes: asset.sizeBytes * 0.85,
        thumb: asset.thumb 
    };
}