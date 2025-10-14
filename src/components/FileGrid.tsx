type FileItem = {
  id: number;
  name: string;
  type: string; // e.g., "image/png", "video/mp4", etc.
  size: string; // human readable for now
};

const mockFiles: FileItem[] = [
  { id: 1, name: "forest_scene.png", type: "image/png", size: "2.1 MB" },
  { id: 2, name: "logo.ai", type: "application/illustrator", size: "812 KB" },
  { id: 3, name: "character_turntable.mp4", type: "video/mp4", size: "34.6 MB" },
  { id: 4, name: "brush_pack.abr", type: "application/abr", size: "6.3 MB" },
  { id: 5, name: "mech_concept.jpg", type: "image/jpeg", size: "1.8 MB" },
  { id: 6, name: "ui_icons.svg", type: "image/svg+xml", size: "95 KB" },
];

function ThumbPlaceholder({ kind }: { kind: string }) {
  const isImage = kind.startsWith("image/");
  const isVideo = kind.startsWith("video/");
  return (
    <div className="aspect-square w-full overflow-hidden rounded-md border border-gray-200 bg-gray-100">
      <div className="h-full w-full grid place-items-center text-gray-400 text-xs">
        {isImage ? "IMG" : isVideo ? "VID" : "FILE"}
      </div>
    </div>
  );
}

export default function FileGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {mockFiles.map((f) => (
        <div key={f.id} className="rounded-lg border border-gray-200 bg-white p-2">
          <ThumbPlaceholder kind={f.type} />
          <div className="mt-2">
            <div className="truncate text-sm font-medium">{f.name}</div>
            <div className="text-xs text-gray-500">
              {f.type} • {f.size}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}