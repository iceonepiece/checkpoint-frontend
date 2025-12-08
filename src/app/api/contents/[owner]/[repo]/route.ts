import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ owner: string; repo: string }> } // 1. Type is now Promise
) {
  const auth = await authenticate();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;

  // 2. Await the params before using them
  const { owner, repo } = await context.params;

  const search = req.nextUrl.searchParams;
  const path = search.get("path") ?? "";
  const branch = search.get("branch") ?? "main";

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unable to fetch repository contents" },
      { status: err.status ?? 500 }
    );
  }
}