import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> }
) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const message = formData.get("message") as string | null;
    const description = formData.get("description") as string | null;

    if (!file) {
        return NextResponse.json({ message: "No file received" }, { status: 400 });
    }
    if (!message) {
        return NextResponse.json({ message: "No commit message" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const auth = await authenticate();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { octokit } = auth;
    const { owner, repo } = await context.params;
    
    const search = req.nextUrl.searchParams;
    const currentPath = search.get("path") ?? "";
    const branch = search.get("branch") ?? "main";

    const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;

    const fullCommitMessage = description 
        ? `${message}\n\n${description}` 
        : message;

    try
    {
        let sha: string | undefined;

        try {
            const { data: existingFile } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: branch,
            });

            if (!Array.isArray(existingFile) && existingFile.type === "file") {
                sha = existingFile.sha;
            }
        } catch (error: unknown) {
            // Check if error is 404 (File not found)
            if ((error as any).status !== 404) {
                throw error;
            }
        }

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: filePath,
            message: fullCommitMessage,
            content: buffer.toString("base64"),
            branch,
            sha, 
        });

        return NextResponse.json({
            message: `File ${file.name} uploaded successfully`,
            path: filePath
        });

    } catch (err: unknown) {
        console.error("Upload Error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}