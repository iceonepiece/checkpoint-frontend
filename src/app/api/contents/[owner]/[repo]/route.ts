import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// interface FileItem {
//     path: string;
//     [key: string]: unknown;
// }

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ owner: string; repo: string }> }
) {
  const auth = await authenticate();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;
  const { owner, repo } = await context.params;

  const search = req.nextUrl.searchParams;
  const path = search.get("path") ?? "";
  const branch = search.get("branch") || undefined;

  try {
    const { data: githubData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (!Array.isArray(githubData)) {
      return NextResponse.json(githubData);
    }

    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const repoId = repoData.id;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const paths = githubData.map(item => item.path);
    
    const { data: trackedFiles } = await supabase
        .from("files")
        .select(`
            path,
            comments:comments(count),
            lock_events (
                is_locked,
                created_at,
                user:users (username)
            )
        `)
        .eq("repo_id", repoId)
        .in("path", paths)
        .order("created_at", { foreignTable: "lock_events", ascending: false });

    const enrichedData = githubData.map((item) => {
        const dbFile = trackedFiles?.find(f => f.path === item.path);
        
        // Fix for array access on potentially undefined comments
        const comments = dbFile?.comments as unknown as { count: number }[] | undefined;
        const commentCount = comments?.[0]?.count ?? 0;

        // Fix for array access on potentially undefined lock_events
        const locks = dbFile?.lock_events as unknown as { is_locked: boolean, created_at: string, user: { username: string } }[] | undefined;
        const latestLock = locks?.[0];
        
        const isLocked = latestLock?.is_locked ?? false;
        const lockedBy = isLocked ? (latestLock?.user?.username ?? "Unknown") : undefined;
        const lockedAt = isLocked ? latestLock?.created_at : undefined;

        return {
            ...item,
            commentsCount: commentCount,
            lockedBy,
            lockedAt
        };
    });

    return NextResponse.json(enrichedData);

  } catch (err: unknown) {
    console.error("Content API Error:", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "Unable to fetch repository contents" },
      { status: 500 }
    );
  }
}