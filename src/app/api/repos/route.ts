import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {

  // 1. Authenticate user
  const auth = await authenticate();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;

  try 
  {
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
    });

    return NextResponse.json(repos);

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }

}