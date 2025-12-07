import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Octokit } from "octokit";

export async function authenticate() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return { error: "No session cookie found", status: 401 };
  }

  const supabase = createClient(cookieStore);

  const { data: session, error } = await supabase
    .from("sessions")
    .select("github_id, github_access_token")
    .eq("session_token", sessionToken)
    .maybeSingle();

  if (error || !session) {
    return { error: "Invalid session", status: 401 };
  }

  /*
  // Check expiration
  if (new Date(session.expires_at) < new Date()) {
    return { error: "Session expired", status: 401 };
  }
  */

  // User token to call GitHub API
  const githubToken = session.github_access_token;

  const octokit = new Octokit({ auth: githubToken });

  return {
    ok: true,
    userId: session.github_id,
    githubToken,
    octokit,
  };
}
