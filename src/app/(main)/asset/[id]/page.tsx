import { MOCK_ASSETS } from "@/lib/mockAssets";
import AssetPreview from "@/components/AssetPreview";
import ReviewPanel from "@/components/ReviewPanel";
import { Card, KeyRow, SectionTitle } from "@/components/ui";
import Link from "next/link";

type Params = { params: { id: string } };

export default function AssetPage({ params }: Params) {
  const asset = MOCK_ASSETS[params.id] ?? Object.values(MOCK_ASSETS)[0];

  return (
    <section className="space-y-6 px-6 py-6">
      {/* Header */}
      <Card className="p-4">
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
            <button className="rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-sm text-gray-200 hover:bg-[#1c2128]">
              Download
            </button>
            <button className="rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-sm text-gray-200 hover:bg-[#1c2128]">
              Lock
            </button>
            <button className="rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-sm text-gray-200 hover:bg-[#1c2128]">
              Compare
            </button>
          </div>
        </div>
      </Card>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        {/* Left: big preview + meta + versions */}
        <div className="space-y-4">
          <Card className="p-3">
            <AssetPreview src={asset.thumb} type={asset.type} alt={asset.name} />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Metadata */}
            <Card className="p-3">
              <SectionTitle>Metadata</SectionTitle>
              <div className="mt-2 divide-y divide-[#30363d]">
                <KeyRow k="Type" v={asset.type} />
                <KeyRow k="Size" v={`${(asset.sizeBytes / (1024 * 1024)).toFixed(2)} MB`} />
                <KeyRow k="Modified" v={new Date(asset.modifiedAt).toLocaleString()} />
                <KeyRow k="Status" v={asset.status} />
                <KeyRow k="Path" v={"/Alpha/Assets"} />
              </div>
            </Card>

            {/* Versions */}
            <Card className="p-3">
              <SectionTitle>Versions</SectionTitle>
              <ul className="mt-2 space-y-2">
                {asset.versions.map((v) => (
                  <li key={v.id} className="flex items-center justify-between rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200">
                    <span>{v.label}</span>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>{new Date(v.date).toLocaleDateString()}</span>
                      <Link href={`/compare/${asset.id}/${v.id}`} className="rounded-md px-2 py-1 hover:bg-white/5">Compare</Link>
                      <Link href="#" className="rounded-md px-2 py-1 hover:bg-white/5">Rollback</Link>
                      <Link href="#" className="rounded-md px-2 py-1 hover:bg-white/5">Download</Link>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Right: review panel */}
        <ReviewPanel initialStatus={asset.status} />
      </div>
    </section>
  );
}