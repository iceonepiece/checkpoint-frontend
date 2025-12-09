import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

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
    // 1. Fetch File List from GitHub
    const { data: githubData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    // If it's a single file (not a folder), return as is (AssetPage handles details)
    if (!Array.isArray(githubData)) {
      return NextResponse.json(githubData);
    }

    // 2. Fetch Comment Counts from Supabase
    // We need the Repo ID first. To optimize, ideally store/cache this, but here we fetch it.
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const repoId = repoData.id;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get all paths in this folder that have comments
    const paths = githubData.map(item => item.path);
    
    const { data: trackedFiles } = await supabase
        .from("files")
        .select(`
            path,
            comments:comments(count)
        `)
        .eq("repo_id", repoId)
        .in("path", paths);

    // 3. Merge Counts into GitHub Data
    const enrichedData = githubData.map((item) => {
        const dbFile = trackedFiles?.find(f => f.path === item.path);
        // Supabase returns count like [{ count: 5 }] or just count depending on query format
        // With select('comments(count)'), it returns comments: [ { count: N } ]
        const commentCount = dbFile?.comments?.[0]?.count ?? 0;

        return {
            ...item,
            commentsCount: commentCount
        };
    });

    return NextResponse.json(enrichedData);

  } catch (err: any) {
    console.error("Content API Error:", err.message);
    return NextResponse.json(
      { error: err.message ?? "Unable to fetch repository contents" },
      { status: err.status ?? 500 }
    );
  }
}