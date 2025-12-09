"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AuthUser } from "@/lib/auth"; // Import AuthUser type

export type Repo = {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
};

type RepoContextType = {
  repos: Repo[];
  currentRepo: Repo | null;
  setRepos: (repos: Repo[]) => void;
  setCurrentRepo: (repo: Repo) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  user: AuthUser | null; // NEW: Add user to context
};

const RepoContext = createContext<RepoContextType | undefined>(undefined);

// Update Provider to accept user prop
export function RepoProvider({ children, user }: { children: ReactNode; user: AuthUser }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [currentRepo, setCurrentRepo] = useState<Repo | null>(null);
  const [loading, setLoading] = useState(true);

  return (
    <RepoContext.Provider value={{ repos, currentRepo, setRepos, setCurrentRepo, loading, setLoading, user }}>
      {children}
    </RepoContext.Provider>
  );
}

export function useRepo() {
  const context = useContext(RepoContext);
  if (context === undefined) {
    throw new Error("useRepo must be used within a RepoProvider");
  }
  return context;
}