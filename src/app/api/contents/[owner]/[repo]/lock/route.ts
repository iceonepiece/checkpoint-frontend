import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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
  const path = search.get("path");
  const isLockedParam = search.get("is_locked");

  if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  const isLocked = isLockedParam === "false" ? false : true;

  try {
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const repoId = repoData.id;

    const cookieStore = await cookies(); 
    const supabase = createClient(cookieStore);

    let { data: fileRow } = await supabase
        .from("files")
        .select("file_id")
        .eq("repo_id", repoId)
        .eq("path", path)
        .maybeSingle();

    if (!fileRow) {
        const { data: newFile, error: createError } = await supabase
            .from("files")
            .insert({ repo_id: repoId, path })
            .select("file_id")
            .single();
        
        if (createError) throw createError;
        fileRow = newFile;
    }

    if (!fileRow) throw new Error("Failed to resolve file ID");

    const { error: lockError } = await supabase
        .from("lock_events")
        .insert({
            file_id: fileRow.file_id,
            is_locked: isLocked,
            github_id: auth.user.github_id 
        });

    if (lockError) {
        return NextResponse.json({ error: lockError.message }, { status: 500 });
    }  

    return NextResponse.json({ 
        message: isLocked ? 'File locked' : 'File unlocked', 
        isLocked 
    });

  } catch (err: unknown) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}