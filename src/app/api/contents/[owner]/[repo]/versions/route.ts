import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> } // 1. Update Type
) {
    const auth = await authenticate();

    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { octokit } = auth;

    // 2. Await Params
    const { owner, repo } = await context.params;

    const search = req.nextUrl.searchParams;
    const path = search.get("path") ?? "";
    const branch = search.get("branch") ?? "main";

    try
    {

        const { data: commits } = await octokit.request(
            "GET /repos/{owner}/{repo}/commits?path={path}&sha={branch}",
            {
                owner,
                repo,
                path,
                branch
            }
        );

        const fileVersions = [];

        for (const commit of commits) {
            const { data: yy } = await octokit.request(
                `GET /repos/{owner}/{repo}/contents/{path}?ref=${commit.sha}`,
                {
                    owner,
                    repo,
                    path,
                }
            );

            fileVersions.push(yy);
        }

        return NextResponse.json(fileVersions);

    } catch (err) {
        return NextResponse.json({ error: err }, { status: 500 });
    }
}
