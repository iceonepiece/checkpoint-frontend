import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function GET() {
  const auth = await authenticate();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;

  try
  {
    const { data: user } = await octokit.rest.users.getAuthenticated();

    const commitSha = "83d4fefe8457b367ad94b807e432987511f00505";
    const filePath = 'flag.png';

    const { data: yy } = await octokit.request(
      `GET /repos/{owner}/{repo}/contents/{path}?ref=${commitSha}`,
      {
        owner: 'iceonepiece',
        repo: 'web-hook-test',
        path: filePath,
      }
    );

    console.log(yy);

    return NextResponse.json(user);

  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}