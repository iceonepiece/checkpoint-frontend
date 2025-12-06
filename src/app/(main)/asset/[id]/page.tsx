"use client";

import { useState, use } from "react";
import { MOCK_ASSETS } from "@/lib/mockAssets";
import AssetPreview from "@/components/AssetPreview";
import DiffViewer from "@/components/DiffViewer";
import ReviewPanel from "@/components/ReviewPanel";
import { Card, KeyRow, SectionTitle, Button } from "@/components/ui";
import Link from "next/link";

type Params = { params: Promise<{ id: string }> };

export default function AssetPage(props: Params) {
  const params = use(props.params);
  const id = params.id;

  const asset = MOCK_ASSETS[id] ?? Object.values(MOCK_ASSETS)[0];
  const oldAsset = getOldVersionMock(asset);
  
  const [compareMode, setCompareMode] = useState(false);
  const [targetVersion, setTargetVersion] = useState(asset.versions[1]?.id || "v1");

  return (
    <section className="space-y-6 px-6 py-6 h-full flex flex-col min-h-0 w-full max-w-screen-xl mx-auto">
      {/* Header */}
      <Card className="p-4 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-100">{asset.name}</h1>
            <div className="text-sm text-gray-400">
              <Link href="/" className="hover:underline">Example-User / Example-Repository</Link>
              <span className="mx-1 text-gray-600">•</span>
              {new Date(asset.modifiedAt).toLocaleString()}
              {asset.lockedBy && (
                <>
                  <span className="mx-1 text-gray-600">•</span>
                  <span className="rounded border border-[#30363d] px-1 text-xs text-gray-300">
                    Locked by {asset.lockedBy}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm">Download</Button>
            <Button size="sm">Lock</Button>
            <Button 
                size="sm" 
                variant={compareMode ? "primary" : "default"}
                onClick={() => setCompareMode(!compareMode)}
            >
              {compareMode ? "Exit Compare" : "Compare"}
            </Button>
          </div>
        </div>
        
        {/* Comparison Toolbar (Only visible in Compare Mode) */}
        {compareMode && (
             <div className="mt-4 pt-4 border-t border-[#30363d] flex items-center gap-4 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-red-400 font-medium">Base:</span>
                    <select 
                        className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-gray-200"
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
                    <span className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-gray-400 cursor-not-allowed">
                        Current
                    </span>
                </div>
             </div>
        )}
      </Card>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 min-h-0 flex-1">
        {/* Left: Preview */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card className="p-3 flex-1 min-h-0 bg-[#0d1117] flex flex-col justify-center">
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

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
            <Card className="p-3">
              <SectionTitle>Metadata</SectionTitle>
              <div className="mt-2 divide-y divide-[#30363d]">
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
              <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
                {asset.versions.map((v) => (
                  <li key={v.id} className="flex items-center justify-between rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200">
                    <span className={v.id === asset.versions[0].id ? "text-green-400 font-medium" : ""}>
                        {v.label} {v.id === asset.versions[0].id && "(Current)"}
                    </span>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>{new Date(v.date).toLocaleDateString()}</span>
                      {!compareMode && (
                          <button 
                            onClick={() => { setCompareMode(true); setTargetVersion(v.id); }}
                            className="text-xs border border-[#30363d] rounded px-2 py-1 hover:bg-white/5"
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
        <div className="min-h-0 overflow-y-auto">
             <ReviewPanel initialStatus={asset.status} />
        </div>
      </div>
    </section>
  );
}

// Helper mock function
function getOldVersionMock(asset: any) {
    return {
        ...asset,
        sizeBytes: asset.sizeBytes * 0.85,
        thumb: asset.thumb 
    };
}