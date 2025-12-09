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
  const assetStatus = search.get("asset_status") ?? null;

    const cookieStore = await cookies(); 
    const supabase = createClient(cookieStore);

  try {
    // 1. Get GitHub directory listing
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (!Array.isArray(fileData)) {
      return NextResponse.json([]); // no directories or single file → ignore
    }

    // 2. Get repo_id from GitHub
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    const repoId = repoData.id;

    // 3. Extract GitHub file paths
    const paths = fileData
      .filter((f) => f.type === "file")
      .map((f) => f.path);

    if (paths.length === 0) {
      return NextResponse.json([]); // folder contains only folders or empty
    }

    // 4. Query Supabase for only files that exist
    let query = supabase
      .from("files")
      .select("path")
      .eq("repo_id", repoId)
      .in("path", paths);

    if (assetStatus) {
      query = query.eq("asset_status", assetStatus);
    }

    const { data: dbFiles, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 5. Create a Set for fast matching
    const dbPathSet = new Set(dbFiles.map((f) => f.path));

    // 6. Filter GitHub list → only items present in DB
    const filteredGitHubFiles = fileData.filter(
      (f) => f.type === "file" && dbPathSet.has(f.path)
    );

    // 7. Return only GitHub data
    return NextResponse.json(filteredGitHubFiles);

  } catch (err) {
    return NextResponse.json(
      { error: err },
      { status:  500 }
    );
  }
}
