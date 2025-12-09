import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getLockStatus } from "@/lib/helpers";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ owner: string; repo: string }> }
) {
  const auth = await authenticate();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit, user } = auth;
  const { owner, repo } = await context.params;

  const search = req.nextUrl.searchParams;
  const path = search.get("path");
  const isLockedParam = search.get("is_locked"); // Desired state

  if (!path) return NextResponse.json({ error: "Path is required" }, { status: 400 });

  const isLockedTarget = isLockedParam === "false" ? false : true;

  try {
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const repoId = repoData.id;

    const cookieStore = await cookies(); 
    const supabase = createClient(cookieStore);

    // 1. Get Current Lock Status
    const { isLocked: currentIsLocked, lockedByUserId, lockedByUsername } = await getLockStatus(supabase, repoId, path);

    // 2. Permission Check
    
    // Case A: Trying to LOCK (isLockedTarget = true)
    // If it is ALREADY locked by someone else, fail.
    if (isLockedTarget && currentIsLocked && lockedByUserId !== user.github_id) {
         return NextResponse.json({ 
            error: `File is already locked by ${lockedByUsername}` 
        }, { status: 403 });
    }

    // Case B: Trying to UNLOCK (isLockedTarget = false)
    // If locked by someone else, check if I am owner
    if (!isLockedTarget && currentIsLocked && lockedByUserId !== user.github_id) {
        // Check if I am repo owner
        if (repoData.owner.login !== user.username) {
            return NextResponse.json({ 
                error: `Only ${lockedByUsername} or the repository owner can unlock this file.` 
            }, { status: 403 });
        }
        // If owner, allow proceed (Override unlock)
    }

    // 3. Resolve/Create File ID
    let { data: fileRow } = await supabase
        .from("files")
        .select("file_id")
        .eq("repo_id", repoId)
        .eq("path", path)
        .maybeSingle();

    if (!fileRow) {
    {
        const { data: newFile, error: createError } = await supabase
            .from("files")
            .upsert(
              { repo_id: repoId, path },
              { onConflict: "repo_id,path" }
            )
            .select()
            .single();
        
        if (createError) throw createError;
        fileRow = newFile;
    }

    // 4. Insert New Lock Event
    const { error: lockError } = await supabase
        .from("lock_events")
        .insert({
            file_id: fileRow.file_id,
            is_locked: isLockedTarget,
            github_id: user.github_id 
        });

    if (lockError) throw lockError;

    return NextResponse.json({ 
        message: isLockedTarget ? 'File locked' : 'File unlocked', 
        isLocked: isLockedTarget 
    });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: err ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}