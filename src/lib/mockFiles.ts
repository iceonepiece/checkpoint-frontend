export type FileItem = {
  id: string;
  name: string;
  type: string;      
  sizeBytes: number; 
  modifiedAt: string;
  thumb?: string;    
  isFolder?: boolean;
  lockedBy?: string;
};

export const MOCK_FILES: FileItem[] = [
  // --- Folders ---
  { id: "f_chars", name: "Characters", type: "folder", sizeBytes: 0, modifiedAt: "2025-01-10", isFolder: true },
  { id: "f_env", name: "Environments", type: "folder", sizeBytes: 0, modifiedAt: "2025-01-12", isFolder: true },
  { id: "f_props", name: "Props", type: "folder", sizeBytes: 0, modifiedAt: "2025-01-08", isFolder: true },
  { id: "f_ui", name: "UI", type: "folder", sizeBytes: 0, modifiedAt: "2025-01-05", isFolder: true },
  
  // --- Character Assets ---
  { 
    id: "i1", 
    name: "Hero_Concept_Final.jpg", 
    type: "image/jpeg", 
    sizeBytes: 1780000, 
    modifiedAt: "2025-01-15", 
    thumb: "/samples/a.jpg" 
  },
  { 
    id: "m1", 
    name: "Hero_BaseMesh.fbx", 
    type: "model/fbx", 
    sizeBytes: 12500000, 
    modifiedAt: "2025-01-16", 
    lockedBy: "Vibhumi.S" 
  },

  // --- Environment Assets ---
  { 
    id: "i2", 
    name: "Forest_Moodboard.png", 
    type: "image/png", 
    sizeBytes: 2100000, 
    modifiedAt: "2025-01-03", 
    thumb: "/samples/b.jpg" 
  },
  { 
    id: "t1", 
    name: "MossyRock_Albedo.tga", 
    type: "image/targa", 
    sizeBytes: 8400000, 
    modifiedAt: "2025-01-14" 
  },

  // --- Docs & Media ---
  { 
    id: "v1", 
    name: "WalkCycle_Preview.mp4", 
    type: "video/mp4", 
    sizeBytes: 34600000, 
    modifiedAt: "2024-06-12" 
  },
  { 
    id: "d1", 
    name: "GameDesignDocument_v2.pdf", 
    type: "application/pdf", 
    sizeBytes: 4200000, 
    modifiedAt: "2025-01-02" 
  },
  { 
    id: "d2", 
    name: "Asset_Naming_Convention.docx", 
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    sizeBytes: 214000, 
    modifiedAt: "2024-12-20" 
  },

  // --- UI Assets ---
  { 
    id: "s1", 
    name: "HUD_Icons_Set.svg", 
    type: "image/svg+xml", 
    sizeBytes: 95000, 
    modifiedAt: "2025-01-18",
    lockedBy: "Jarusrawee.D"
  },
];