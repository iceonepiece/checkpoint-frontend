import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> } // 1. Update Type
) {
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

    const { owner, repo } = await context.params;
    const search = req.nextUrl.searchParams;
    const path = search.get("path") ?? "";
    const branch = search.get("branch") ?? "main";

    try
    {
        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: file.name,
            message,
            content: buffer.toString("base64"),
        });

        return NextResponse.json({
            message: `File ${file.name} uploaded successfully`,
        });

    } catch (err) {
        return NextResponse.json({ error: err }, { status: 500 });
    }
}
