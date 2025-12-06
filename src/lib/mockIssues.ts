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
    id: 31,
    title: "No noise decreasing options",
    status: "open",
    author: "CLangMole",
    date: "3 weeks ago",
    labels: [],
    commentsCount: 1,
    body: "Shafts and fog are too noisy, especially when moving the camera. Also I can barely see them from the side",
    replies: [
      {
        id: "c1",
        author: "CristianQiu",
        avatar: "CQ",
        isOwner: true,
        date: "3 weeks ago",
        content: "If it is too noisy try decreasing distance or increasing the max steps (or both). If I recall correctly a 1 : 2 ratio between distance (1) and max steps (2) should give very good quality.\n\nYou also have to play with anisotropy to see the shafts when not directly looking to the sun source."
      }
    ]
  },
  {
    id: 25,
    title: "Shader Error X8000 unity 6.1",
    status: "open",
    author: "dooly123",
    date: "Jul 12",
    labels: [{ name: "bug", color: "text-red-400", bg: "bg-red-900/20", border: "border-red-800" }],
    commentsCount: 8,
    body: "Getting a compilation error on the new Unity 6.1 beta...",
    replies: []
  },
  {
    id: 7,
    title: "WebGL Compatibility for Unity-URP-Volumetric-Light",
    status: "open",
    author: "librosang",
    date: "Nov 23, 2024",
    labels: [{ name: "enhancement", color: "text-blue-400", bg: "bg-blue-900/20", border: "border-blue-800" }],
    commentsCount: 6,
    body: "Is there any plan to support WebGL builds?",
    replies: []
  }
];