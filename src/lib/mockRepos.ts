export type Repo = {
  id: string;
  owner: string;
  name: string;
  // owner/name
  fullName: string;      
  private?: boolean;
  // org/user avatar
  avatarUrl?: string;    
};

export const MOCK_REPOS: Repo[] = [
  { id: "1", owner: "Example-User-A", fullName: "Example-User-A/Example-Repository-I", name: "Example-Repository-I", avatarUrl: "/avatars/user_placeholder.jpg" },
  { id: "2", owner: "Example-User-B", fullName: "Example-User-A/Example-Repository-I", name: "Example-Repository-I", avatarUrl: "/avatars/user_placeholder.jpg"  },
  { id: "3", owner: "Example-User-A", fullName: "Example-User-A/Example-Repository-II", name: "Example-Repository-II", avatarUrl: "/avatars/user_placeholder.jpg"  }
];