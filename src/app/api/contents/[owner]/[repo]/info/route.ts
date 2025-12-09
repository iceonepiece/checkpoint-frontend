import { NextResponse, NextRequest } from "next/server";
import { authenticate } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const STATUS_TO_INT: Record<string, number> = {
  "Pending": 0,
  "Approved": 1,
  "Needs changes": 2
};

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> }
) {
    const auth = await authenticate();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { owner, repo } = await context.params;
    const { octokit } = auth;
    const path = req.nextUrl.searchParams.get("path");

    if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 });

    try {
        const { data: repoData } = await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // UPDATED: Added lock_events to the selection
        const { data: fileData, error: fileError } = await supabase
            .from("files")
            .select(`
                *,
                comments:comments_file_id_fkey (
                    comment_id,
                    github_id,
                    message,
                    created_at,
                    user:users!comments_github_id_fkey (
                        github_id,
                        username,
                        avatar_url
                    )
                ),
                lock_events (
                    is_locked,
                    created_at,
                    user:users (username)
                )
            `)
            .eq("repo_id", repoData.id)
            .eq("path", path)
            .order("created_at", { foreignTable: "lock_events", ascending: false }) // Get latest lock
            .maybeSingle();

        if (fileError) {
            return NextResponse.json({ error: fileError.message }, { status: 500 });
        }

        if (!fileData) {
            return NextResponse.json({ asset_status: 0, comments: [], lock_events: [] });
        }

        return NextResponse.json(fileData);
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> }
) {
    const auth = await authenticate();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { owner, repo } = await context.params;
    const { octokit } = auth;
    
    const body = await req.json();
    const { path, status } = body; 

    if (!path || !status) return NextResponse.json({ error: "Path and status required" }, { status: 400 });

    const statusInt = STATUS_TO_INT[status];
    if (statusInt === undefined) return NextResponse.json({ error: "Invalid status value" }, { status: 400 });

    try {
        const { data: repoData } = await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        let { data: fileRow } = await supabase
            .from("files")
            .select("file_id")
            .eq("repo_id", repoData.id)
            .eq("path", path)
            .maybeSingle();

        if (!fileRow) {
            const { data: newFile, error: createError } = await supabase
                .from("files")
                .insert({ 
                    repo_id: repoData.id, 
                    path, 
                    asset_status: statusInt 
                })
                .select("file_id")
                .single();
            
            if (createError) throw createError;
            fileRow = newFile;
        } else {
            const { error: updateError } = await supabase
                .from("files")
                .update({ asset_status: statusInt })
                .eq("file_id", fileRow.file_id);
            
            if (updateError) throw updateError;
        }

        return NextResponse.json({ success: true, status: statusInt });

    } catch (error: unknown) {
        console.error("Status Update Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}