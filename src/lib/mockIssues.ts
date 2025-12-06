export type Comment = {
  id: string;
  author: string;
  avatar: string; // Initials or image URL
  content: string;
  date: string;
  isOwner?: boolean;
};

export type Issue = {
  id: number;
  title: string;
  status: "open" | "closed";
  author: string;
  date: string;
  labels: { name: string; color: string; bg: string; border: string }[];
  commentsCount: number;
  body: string; 
  replies: Comment[];
};

export const MOCK_ISSUES: Issue[] = [
  {
    id: 42,
    title: "Main Character: Texture clipping on shoulder armor",
    status: "open",
    author: "Jarusrawee.D",
    date: "2 days ago",
    labels: [
      { name: "bug", color: "text-red-400", bg: "bg-red-900/20", border: "border-red-800" },
      { name: "modeling", color: "text-blue-400", bg: "bg-blue-900/20", border: "border-blue-800" }
    ],
    commentsCount: 3,
    body: "When the character performs the 'Attack_Heavy' animation, the shoulder pad clips through the chest plate. We might need to adjust the skin weights or move the geometry slightly.",
    replies: [
      {
        id: "c1",
        author: "Vibhumi.S",
        avatar: "VS",
        isOwner: true,
        date: "1 day ago",
        content: "I checked the rig. The bone 'Shoulder_L' has too much influence on the chest mesh. I can fix this in Blender by smoothing the weights, but it might require a re-export of the FBX."
      },
      {
        id: "c2",
        author: "ArtLead",
        avatar: "AL",
        content: "Go ahead with the weight fix. Make sure to lock the file before you start working on it so we don't get conflicts.",
        date: "5 hours ago",
        isOwner: false
      }
    ]
  },
  {
    id: 38,
    title: "Environment: Rock_04 UVs are stretching",
    status: "open",
    author: "EnvArtist_01",
    date: "5 days ago",
    labels: [{ name: "needs-fix", color: "text-yellow-400", bg: "bg-yellow-900/20", border: "border-yellow-800" }],
    commentsCount: 1,
    body: "The UV map for the large mossy rock (Rock_04) is distorted on the underside. The texture looks very stretched when viewed from the player camera angle in the cave scene.",
    replies: [
      {
        id: "c3",
        author: "Vibhumi.S",
        avatar: "VS",
        isOwner: true,
        date: "3 days ago",
        content: "On it. I'll unwrap that section again and update the Normal/Albedo maps."
      }
    ]
  },
  {
    id: 15,
    title: "Prop: Potion Bottle polycount is too high",
    status: "open",
    author: "TechArtist_Dan",
    date: "1 week ago",
    labels: [{ name: "optimization", color: "text-purple-400", bg: "bg-purple-900/20", border: "border-purple-800" }],
    commentsCount: 0,
    body: "The current potion bottle model is 15,000 tris. This is way too high for a consumable item that appears 20 times on screen. Please bake the high-poly details down to a low-poly mesh (aim for < 500 tris).",
    replies: []
  },
  {
    id: 12,
    title: "UI: Icons missing for new inventory items",
    status: "closed",
    author: "Jarusrawee.D",
    date: "2 weeks ago",
    labels: [],
    commentsCount: 2,
    body: "We added the 'Ancient Key' and 'Dragon Scale' items to the database, but they are showing as white squares in the inventory menu.",
    replies: []
  }
];