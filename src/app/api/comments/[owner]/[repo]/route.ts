import { NextResponse, NextRequest } from "next/server";
import { authenticate } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Octokit } from "octokit";


async function userHasAccessToRepo(octokit: Octokit, repo_id : Number) {
    try {
      const { data } = await octokit.request("GET /repositories/{repo_id}", {
        repo_id
      });
  
      // If it returns data → you have access
      return { ok: true, repo: data };
  
    } catch (err) {
      if (err.status === 404) {
        // Repo exists but you have NO ACCESS
        return { ok: false, reason: "not_found_or_private" };
      }
      throw err; // unknown error
    }
  }
  

export async function POST(req : Request) {
    const auth = await authenticate();

    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { file_id, message } = body;
  
    if (!file_id || !message) {
        return NextResponse.json(
            { error: "file_id and message are required" },
            { status: 400 }
        );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);


    const { data: fileData, error: fileError } = await supabase
        .from("files")
        .select()
        .eq("file_id", file_id);


    if (fileError)
    {
        return NextResponse.json({ error: fileError.message }, { status: 404 });
    }

    const { octokit } = auth;
    const result = await userHasAccessToRepo(octokit, fileData.repo_id);

    if (!result.ok) {
        return NextResponse.json({ error: "No access" }, { status: 403 });
    }

    const { data, error } = await supabase
        .from("comments")
        .insert({
            file_id,
            github_id: auth.user?.github_id,
            message,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment: data });
}