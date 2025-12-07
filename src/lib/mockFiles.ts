export type FileItem = {
  id: string;
  name: string;
  type: string;      
  sizeBytes: number; 
  modifiedAt: string;
  thumb?: string;    
  isFolder?: boolean;
  lockedBy?: string;
  lockedAt?: string; // New field for lock timestamp
  folderId?: string;
};

export const MOCK_FILES: FileItem[] = [
  // --- Character Assets (folderId: 'chars') ---
  { 
    id: "i1", 
    name: "Hero_Concept_Final.jpg", 
    type: "image/jpeg", 
    sizeBytes: 1780000, 
    modifiedAt: "2025-01-15", 
    thumb: "/samples/a.jpg",
    folderId: "chars"
  },
  { 
    id: "m1", 
    name: "Hero_BaseMesh.fbx", 
    type: "model/fbx", 
    sizeBytes: 12500000, 
    modifiedAt: "2025-01-16", 
    lockedBy: "Vibhumi.S",
    lockedAt: "2025-01-16T09:30:00Z", // Added timestamp
    folderId: "chars"
  },

  // --- Environment Assets (folderId: 'env') ---
  { 
    id: "i2", 
    name: "Forest_Moodboard.png", 
    type: "image/png", 
    sizeBytes: 2100000, 
    modifiedAt: "2025-01-03", 
    thumb: "/samples/b.jpg",
    folderId: "env" 
  },
  { 
    id: "t1", 
    name: "MossyRock_Albedo.tga", 
    type: "image/targa", 
    sizeBytes: 8400000, 
    modifiedAt: "2025-01-14",
    folderId: "env"
  },

  // --- Root/Misc Assets (folderId: 'assets') ---
  { 
    id: "d1", 
    name: "GameDesignDocument_v2.pdf", 
    type: "application/pdf", 
    sizeBytes: 4200000, 
    modifiedAt: "2025-01-02",
    folderId: "assets"
  },
  
  // --- UI Assets (folderId: 'ui') ---
  { 
    id: "s1", 
    name: "HUD_Icons_Set.svg", 
    type: "image/svg+xml", 
    sizeBytes: 95000, 
    modifiedAt: "2025-01-18",
    lockedBy: "Jarusrawee.D",
    lockedAt: "2025-01-18T14:20:00Z", // Added timestamp
    folderId: "ui"
  },
];