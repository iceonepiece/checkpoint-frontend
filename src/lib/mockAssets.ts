export type Comment = {
  id: string;
  user: string;
  text: string;
  date: string;
  avatarUrl?: string; 
};

// Extracted and updated Version type
export type AssetVersion = {
  id: string;
  label: string;
  date: string;
  thumb?: string;      // Added
  sizeBytes?: number;  // Added
  author?: string;
};

export type Asset = {
  id: string;
  name: string;
  type: string;       
  sizeBytes: number;
  modifiedAt: string;
  thumb?: string;     
  versions: AssetVersion[]; // Updated to use the new type
  status: "Needs changes" | "Pending" | "Approved";
  lockedBy?: string;
  comments: Comment[];
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
    comments: [
      { id: "c1", user: "Art Lead", text: "The lighting feels a bit flat on the left side.", date: "2d ago" },
      { id: "c2", user: "Vibhumi.S", text: "Noted. I will boost the rim light in v4.", date: "1d ago" }
    ]
  },
  m1: {
    id: "m1",
    name: "Hero_BaseMesh.fbx",
    type: "model/fbx",
    sizeBytes: 12500000,
    modifiedAt: "2025-01-16T09:30:00Z",
    versions: [
      { id: "v2", label: "v2", date: "2025-01-16" },
      { id: "v1", label: "v1", date: "2025-01-10" }
    ],
    status: "Approved",
    lockedBy: "Vibhumi.S",
    comments: [
       { id: "c1", user: "Tech Artist", text: "Topology looks clean. Ready for rigging.", date: "5h ago" }
    ]
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
    comments: [
        { id: "c1", user: "Art Lead", text: "Too much saturation in the foliage.", date: "3d ago" }
    ]
  },
  t1: {
    id: "t1",
    name: "MossyRock_Albedo.tga",
    type: "image/targa",
    sizeBytes: 8400000,
    modifiedAt: "2025-01-14T11:20:00Z",
    thumb: "/samples/b.jpg",
    versions: [
      { id: "v1", label: "v1", date: "2025-01-14" }
    ],
    status: "Pending",
    comments: []
  },
  d1: {
    id: "d1",
    name: "GameDesignDocument_v2.pdf",
    type: "application/pdf",
    sizeBytes: 4200000,
    modifiedAt: "2025-01-02T14:00:00Z",
    versions: [
        { id: "v2", label: "v2", date: "2025-01-02" },
        { id: "v1", label: "v1", date: "2024-12-15" }
    ],
    status: "Approved",
    comments: []
  },
  s1: {
    id: "s1",
    name: "HUD_Icons_Set.svg",
    type: "image/svg+xml",
    sizeBytes: 95000,
    modifiedAt: "2025-01-18T14:20:00Z",
    versions: [
        { id: "v1", label: "v1", date: "2025-01-18" }
    ],
    status: "Pending",
    lockedBy: "Jarusrawee.D",
    comments: []
  }
};