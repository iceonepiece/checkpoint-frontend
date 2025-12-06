import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function GET(
  req: Request,
  { params }: { params: { path?: string[] } }
) {
  const getParams = await params;
  const pathArray = getParams.path ?? [];       // [] if no path
  const path = pathArray.join("/");          // "src/index.js"

  try 
  {

    const accessToken = "xxx"
    
    const octokit = new Octokit({ auth: accessToken });

    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
    });

    const repo = repos[0];

    const { data: content } = await octokit.rest.repos.getContent({
      owner: repo.owner.login,
      repo: repo.name,
      path,      // empty = repo root
    });

    return NextResponse.json(content);

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
}

}