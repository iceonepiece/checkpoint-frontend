import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isFileObject } from "@/lib/helpers";  

export async function PUT(
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
  const branch = search.get("branch") ?? "main";

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
            .maybeSingle();

        if (!fileRow) {
            await supabase.from("files").insert({
                repo_id: repoId,
                path,
            });
        }

        if (error) {
            console.error("Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ text: 'successfully tracked a file'});
    } else {
        return NextResponse.json({ error: "This path is not a valid file" }, { status: 400 });
    }
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Unable to fetch repository contents" },
      { status: 500 }
    );
  }
}