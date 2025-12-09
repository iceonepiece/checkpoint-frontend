import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await authenticate();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const search = req.nextUrl.searchParams;
  const owner = search.get("owner");
  const repo = search.get("repo");
  const branch = search.get("branch") ?? "main";

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  const { octokit } = auth;

  try {
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "true",
    });

    const folders = data.tree.filter((item) => item.type === "tree");

    return NextResponse.json({ tree: folders });
  } catch (error: unknown) {
    console.error("Tree Fetch Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}