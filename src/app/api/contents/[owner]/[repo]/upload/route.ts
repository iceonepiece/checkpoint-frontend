import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { uploadMultipleFiles } from "@/lib/github/uploadMultipleFiles";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ owner: string; repo: string }> }
) {
  const formData = await req.formData();

  const files = formData.getAll("files") as File[];
  const message = formData.get("message") as string | null;

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "No commit message" }, { status: 400 });
  }

  const { owner, repo } = await context.params;
  const search = req.nextUrl.searchParams;
  const directory = search.get("path") ?? "";
  const branch = search.get("branch") ?? "main";

  const auth = await authenticate();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;

  try {
    // Convert each uploaded File → Buffer + repo path
    const filesToCommit = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fullPath = directory ? `${directory}/${file.name}` : file.name;
        return {
          path: fullPath,
          buffer,
        };
      })
    );

    const result = await uploadMultipleFiles({
      octokit,
      owner,
      repo,
      files: filesToCommit,
      message,
      branch,
    });

    return NextResponse.json({
      message: `Committed ${files.length} file(s)`,
      commit: result.commitSha,
      files: result.files,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message ?? String(err) },
      { status: 500 }
    );
  }
}
