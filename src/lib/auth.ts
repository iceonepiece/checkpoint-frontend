import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Octokit } from "octokit";

export type AuthUser = {
  id: number;
  username: string;
  avatar_url: string;
};

export async function authenticate() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return { ok: false, error: "No session cookie found", status: 401 };
  }

  const supabase = createClient(cookieStore);

  // 1. Get Session
  const { data: session, error } = await supabase
    .from("sessions")
    .select("github_id, github_access_token")
    .eq("session_token", sessionToken)
    .maybeSingle();

  if (error || !session) {
    return { ok: false, error: "Invalid session", status: 401 };
  }

  // 2. Get User Profile
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("github_id", session.github_id)
    .single();

  const githubToken = session.github_access_token;
  const octokit = new Octokit({ auth: githubToken });

  return {
    ok: true,
    user: user as AuthUser, // Returns { username, avatar_url, ... }
    githubToken,
    octokit,
  };
}