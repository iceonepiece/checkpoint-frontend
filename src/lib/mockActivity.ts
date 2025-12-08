export type StatItem = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
};

export type ActivityItem = {
  id: string;
  user: string;
  avatar: string; // Initials or URL
  action: "pushed" | "merged" | "locked" | "uploaded" | "commented";
  target: string;
  time: string;
};

export type ContributionDay = {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0=Empty, 4=High
};

// --- Mock Data ---
export const PROJECT_STATS: StatItem[] = [
  { label: "Total Assets", value: "1,204", change: "+12 this week", trend: "up" },
  { label: "Storage Used", value: "45.2 GB", change: "24% of quota", trend: "neutral" },
  { label: "Open Issues", value: "8", change: "3 critical", trend: "down" },
  { label: "Active Contributors", value: "12", change: "Online now: 4", trend: "up" },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "e1", user: "Vibhumi S.", avatar: "VS", action: "pushed", target: "main", time: "2 hours ago" },
  { id: "e2", user: "Jarusrawee D.", avatar: "JD", action: "merged", target: "#42 Fix Shader", time: "5 hours ago" },
  { id: "e3", user: "Art Lead", avatar: "AL", action: "locked", target: "forest_scene.png", time: "1 day ago" },
  { id: "e4", user: "Vibhumi S.", avatar: "VS", action: "uploaded", target: "mech_concept.jpg", time: "2 days ago" },
  { id: "e5", user: "EnvArtist_01", avatar: "EA", action: "commented", target: "Rock_04 UVs", time: "3 days ago" },
];

// Generate fake heatmap data
export const HEATMAP_DATA: ContributionDay[] = Array.from({ length: 364 }).map((_, i) => {
  // Create a fake pattern
  const date = new Date();
  date.setDate(date.getDate() - (364 - i));
  const dayOfWeek = date.getDay();
  
  let level: 0 | 1 | 2 | 3 | 4 = 0;
  let count = 0;

  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      if (Math.random() > 0.4) {
          level = Math.floor(Math.random() * 4) + 1 as 0|1|2|3|4;
          count = level * 3; // fake commit count
      }
  }

  return {
      date: date.toISOString().split('T')[0],
      level,
      count
  };
});