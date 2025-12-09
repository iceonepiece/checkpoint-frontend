import { NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function GET(
  req: Request,
  { params }: { params: { path?: string[] } }
) {
  const getParams = await params;
  const pathArray = getParams.path ?? []; 
  const path = pathArray.join("/");

  try 
  {
    const accessToken = "xxx"; // NOTE: This looks like a placeholder, consider removing or using env
    
    const octokit = new Octokit({ auth: accessToken });

    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
    });

    const repo = repos[0];

    const { data: content } = await octokit.rest.repos.getContent({
      owner: repo.owner.login,
      repo: repo.name,
      path, 
    });

    return NextResponse.json(content);

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
}
}