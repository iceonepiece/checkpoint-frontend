export type Asset = {
  id: string;
  name: string;
  // mime
  type: string;       
  sizeBytes: number;
  // ISO
  modifiedAt: string;
  // image url 
  thumb?: string;     
  versions: { id: string; label: string; date: string }[];
  status: "Needs changes" | "Pending" | "Approved";
  lockedBy?: string;
};

export const MOCK_ASSETS: Record<string, Asset> = {
  i1: {
    id: "i1",
    name: "mech_concept.jpg",
    type: "image/jpeg",
    sizeBytes: 1780000,
    modifiedAt: "2025-01-15T10:00:00Z",
    thumb: "/samples/a.jpg",
    versions: [
      { id: "v3", label: "v3", date: "2025-01-15" },
      { id: "v2", label: "v2", date: "2025-01-07" },
      { id: "v1", label: "v1", date: "2025-01-02" },
    ],
    status: "Pending",
  },
  i2: {
    id: "i2",
    name: "forest_scene.png",
    type: "image/png",
    sizeBytes: 2100000,
    modifiedAt: "2025-01-03T08:00:00Z",
    thumb: "/samples/b.jpg",
    versions: [
      { id: "v2", label: "v2", date: "2025-01-03" },
      { id: "v1", label: "v1", date: "2024-12-30" },
    ],
    status: "Needs changes",
    lockedBy: "Example-User",
  },
};