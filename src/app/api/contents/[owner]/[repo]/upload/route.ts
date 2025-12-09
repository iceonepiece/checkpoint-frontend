import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { uploadMultipleFiles } from "@/lib/github/uploadMultipleFiles";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> }
) {
    const formData = await req.formData();
    
    // 1. Get all files
    const files = formData.getAll("files") as File[];
    const message = formData.get("message") as string | null;
    const description = formData.get("description") as string | null;

    if (!files || files.length === 0) {
        return NextResponse.json({ message: "No files received" }, { status: 400 });
    }
    if (!message) {
        return NextResponse.json({ message: "No commit message" }, { status: 400 });
    }

    const auth = await authenticate();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { octokit } = auth;
    const { owner, repo } = await context.params;
    
    const search = req.nextUrl.searchParams;
    const currentPath = search.get("path") ?? "";
    const branch = search.get("branch") ?? "main";

    const fullCommitMessage = description 
        ? `${message}\n\n${description}` 
        : message;

    try {
        // 2. Prepare files for the Git Tree
        const filesToCommit = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                // Combine folder path with filename
                const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
                
                return {
                    path: filePath,
                    buffer: Buffer.from(arrayBuffer)
                };
            })
        );

        // 3. Perform a single commit with all files
        const result = await uploadMultipleFiles({
            octokit,
            owner,
            repo,
            branch,
            message: fullCommitMessage,
            files: filesToCommit
        });

        return NextResponse.json({
            message: `Successfully uploaded ${files.length} files`,
            commit: result.commitSha
        });

    } catch (err: any) {
        console.error("Upload Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}