import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

// --- Local Interfaces for GitHub Data ---

interface GitTreeItem {
  type?: string;
  path?: string;
  mode?: string;
  sha?: string;
  size?: number;
  url?: string;
}

interface GitHubActor {
  login: string;
  avatar_url: string;
}

interface GitHubEvent {
  id: string;
  type: string | null; 
  actor: GitHubActor;
  created_at: string | null;
  payload: {
    ref?: string;
    action?: string;
    number?: number;
    // UPDATED: Fields to access message/title
    issue?: {
      number: number;
      title?: string;
    };
    pull_request?: {
      number: number;
      title?: string;
    };
    commits?: {
      message: string;
    }[];
  };
}

interface GitHubContributor {
  id?: number;
  login?: string;
  avatar_url?: string;
  type?: string;
}

export async function GET(req: NextRequest) {
  const auth = await authenticate();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;
  const search = req.nextUrl.searchParams;
  const owner = search.get("owner");
  const repo = search.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  try {
    const [repoData, contributorsData, eventsData, treeData] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listContributors({ owner, repo, per_page: 10 }),
      octokit.rest.activity.listRepoEvents({ owner, repo, per_page: 20 }),
      octokit.rest.git.getTree({ 
        owner, 
        repo, 
        tree_sha: "main", 
        recursive: "true" 
      }).catch(() => ({ data: { tree: [] } }))
    ]);

    const r = repoData.data;
    
    // --- Stats ---
    const treeItems = treeData.data.tree as GitTreeItem[];
    const fileCount = treeItems.filter((t) => t.type === "blob").length;
    
    const storageKB = r.size;
    const storageVal = storageKB > 1024 
        ? `${(storageKB / 1024).toFixed(1)} MB` 
        : `${storageKB} KB`;

    const stats = [
        { label: "Total Assets", value: fileCount.toLocaleString(), change: "Files in repo", trend: "neutral" },
        { label: "Storage Used", value: storageVal, change: "Git storage", trend: "neutral" },
        { label: "Open Issues", value: r.open_issues_count.toString(), change: "Active issues", trend: "neutral" },
        { label: "Contributors", value: contributorsData.data.length.toString(), change: "People", trend: "neutral" },
    ];

    // --- Activity ---
    const rawEvents = eventsData.data as unknown as GitHubEvent[];

    const activity = rawEvents
        .filter((e) => e.type === "PushEvent" || e.type === "PullRequestEvent" || e.type === "IssuesEvent")
        .slice(0, 5)
        .map((e) => {
            let action = "acted";
            let target = "";
            let message = ""; // NEW: Capture the message

            if (e.type === "PushEvent" && e.payload.ref) {
                action = "pushed to";
                target = e.payload.ref.replace("refs/heads/", "");
                // Extract the last commit message
                if (e.payload.commits && e.payload.commits.length > 0) {
                    message = e.payload.commits[e.payload.commits.length - 1].message;
                }
            } else if (e.type === "PullRequestEvent") {
                action = e.payload.action || "updated"; 
                target = `PR #${e.payload.number}`;
                message = e.payload.pull_request?.title || "";
            } else if (e.type === "IssuesEvent") {
                action = e.payload.action || "updated";
                target = `Issue #${e.payload.issue?.number}`;
                message = e.payload.issue?.title || "";
            }

            return {
                id: e.id,
                user: e.actor.login,
                avatar: e.actor.avatar_url,
                action,
                target,
                message, // Pass message to frontend
                time: e.created_at ? new Date(e.created_at).toLocaleDateString() : "Unknown date",
            };
        });

    // --- Contributors ---
    const rawContributors = contributorsData.data as GitHubContributor[];
    const collaborators = rawContributors.map((c) => ({
        id: c.id ?? 0,
        username: c.login ?? "Unknown",
        avatar: c.avatar_url ?? "",
        role: c.login === owner ? "Owner" : "Contributor"
    }));

    return NextResponse.json({
        stats,
        activity,
        collaborators,
    });

  } catch (error: unknown) {
    console.error("Overview Data Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}