import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function GET(req: NextRequest) {

  try 
  {
    const accessToken = "xxx";
    
    const octokit = new Octokit({ auth: accessToken });

    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
    });

    const repo = repos[0];

  const { data: files } = await octokit.rest.repos.getContent({
    owner: repo.owner.login,
    repo: repo.name,
    path: "",      // empty = repo root
  });


  if (Array.isArray(files)) {
    // Directory
    files.forEach(item => {
      console.log(`${item.type}: ${item.name}`);
    });
  } else {
    // File
    console.log(`${files.type}: ${files.name}`);
  }


    return NextResponse.json(files);

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
}

}