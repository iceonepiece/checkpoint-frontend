import { NextResponse, NextRequest } from "next/server";
import { authenticate } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> } // 1. Update Type
) {
    const auth = await authenticate();

    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { owner, repo } = await context.params;
    const { octokit } = auth;

    const { data: repoData } = await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });

    console.log(repoData);

    const search = req.nextUrl.searchParams;
    const path = search.get("path") ?? "";
    const branch = search.get("branch") ?? "main";

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: fileData, error: fileError } = await supabase
        .from("files")
        .select(`
            *,
            comments:comments_file_id_fkey (
              comment_id,
              github_id,
              message,
              created_at
            )
          `)
        .eq("repo_id", repoData.id)
        .eq("path", path)
        .single();


    if (fileError) {
        return NextResponse.json({ error: fileError.message }, { status: 500 });
    }

    return NextResponse.json(fileData);
}
