import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const message = formData.get("message") as string | null;

  if (!file) {
    return NextResponse.json({ message: "No file received" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ message: "No commit message" }, { status: 400 });
  }

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log("Uploaded file:", file.name);
  console.log("Size:", file.size);
  console.log("Type:", file.type);
  console.log("Commit message:", message);

  const auth = await authenticate();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;

  try
  {
    await octokit.rest.repos.createOrUpdateFileContents({
        owner: 'iceonepiece',
        repo: 'web-hook-test',
        path: file.name,
        message,
        content: buffer.toString("base64"),
      });

    return NextResponse.json({
    message: `File ${file.name} uploaded successfully`,
    });

  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }

}
