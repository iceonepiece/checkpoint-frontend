import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isFileObject } from "@/lib/helpers";  

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ owner: string; repo: string }> } // 1. Update Type
) {
  const auth = await authenticate();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;

  // 2. Await Params
  const { owner, repo } = await context.params;

  const search = req.nextUrl.searchParams;
  const path = search.get("path") ?? "";
  const branch = search.get("branch") ?? "main";
  const isLocked = search.get("is_locked") ?? true;

  try {
    const { data: contentData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
    });

    if (isFileObject(contentData)) {
        const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    
        const repoId = repoData.id;
        const cookieStore = await cookies(); 
        const supabase = createClient(cookieStore);

        const { data: fileRow, error } = await supabase
            .from("files")
            .select()
            .eq("repo_id", repoId)
            .eq("path", path)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
            console.error("Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (fileRow) {
            const { error: lockError } = await supabase
                .from("lock_events")
                .insert({
                    file_id: fileRow.file_id,
                    is_locked: isLocked,
                    github_id: auth.user.id // Fixed: use auth.user.id not auth.userId
                });

            if (lockError) {
                console.error("Error:", lockError);
                return NextResponse.json({ error: lockError.message }, { status: 500 });
            }  
        }

        return NextResponse.json({ text: 'successfully updated lock'});
    } else {
        return NextResponse.json({ error: "This path is not a valid file" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unable to fetch repository contents" },
      { status: err.status ?? 500 }
    );
  }
}