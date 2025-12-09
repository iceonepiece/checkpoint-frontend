import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await authenticate();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit, githubToken } = auth;
  const search = req.nextUrl.searchParams;
  const owner = search.get("owner");
  const repo = search.get("repo");
  const path = search.get("path");

  if (!owner || !repo || !path) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data) || !data.download_url) {
      return NextResponse.json({ error: "Not a downloadable file" }, { status: 400 });
    }

    const fileResponse = await fetch(data.download_url, {
      headers: {
        "Authorization": `Bearer ${githubToken}`
      }
    });

    if (!fileResponse.ok) {
        throw new Error(`GitHub upstream error: ${fileResponse.statusText}`);
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Disposition", `attachment; filename="${data.name}"`);
    headers.set("Content-Length", fileResponse.headers.get("content-length") || "");

    return new NextResponse(fileResponse.body, {
      status: 200,
      headers,
    });

  } catch (error: unknown) {
    console.error("Download Proxy Error:", error);
    return NextResponse.json({ error: "Failed to stream file" }, { status: 500 });
  }
}