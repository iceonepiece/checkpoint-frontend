import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth"; // your reusable helper

export async function GET(
  req: NextRequest,
  context: { params: { owner: string; repo: string } }
) {
  // 1. Authenticate user
  const auth = await authenticate();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;

  // 2. Extract route params
  const { owner, repo } = context.params;

  // 3. Extract query parameters
  const search = req.nextUrl.searchParams;
  const path = search.get("path") ?? "";
  const branch = search.get("branch") ?? "main";

  try {
    // 4. Fetch GitHub repo contents
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
