import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function GET() {
  const auth = await authenticate();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;


  const filePath = "flag.png";

  try
  {
    //const { data: user } = await octokit.rest.users.getAuthenticated();

    const { data: commits } = await octokit.request(
      "GET /repos/{owner}/{repo}/commits?path={path}&sha={branch}",
      {
        owner: 'iceonepiece',
        repo: 'web-hook-test',
        path: filePath,
        branch: "main"
      }
    );

    const fileVersions = [];

    for (const commit of commits) {
        const { data: yy } = await octokit.request(
            `GET /repos/{owner}/{repo}/contents/{path}?ref=${commit.sha}`,
            {
              owner: 'iceonepiece',
              repo: 'web-hook-test',
              path: filePath,
            }
        );
        fileVersions.push(yy);
    }
    

    return NextResponse.json({ fileVersions });

  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
