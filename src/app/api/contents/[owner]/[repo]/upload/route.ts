import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> }
) {
    // 1. Parse Form Data
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

    // 2. Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Authenticate
    const auth = await authenticate();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { octokit } = auth;
    const { owner, repo } = await context.params;
    
    // 4. Determine Target Path
    const search = req.nextUrl.searchParams;
    const currentPath = search.get("path") ?? "";
    const branch = search.get("branch") ?? "main";

    // Combine folder path with filename
    const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;

    const fullCommitMessage = description 
        ? `${message}\n\n${description}` 
        : message;

    try
    {
        // 5. Check if file exists to get SHA (Required for updates)
        let sha: string | undefined;

        try {
            const { data: existingFile } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: branch,
            });

            // If found and it's a single file (not a dir listing), get the SHA
            if (!Array.isArray(existingFile) && existingFile.type === "file") {
                sha = existingFile.sha;
            }
        } catch (error: any) {
            // If 404, file doesn't exist yet, which is fine (creating new file)
            if (error.status !== 404) {
                throw error; // Rethrow other errors
            }
        }

        // 6. Upload to GitHub (Create or Update)
        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: filePath,
            message: fullCommitMessage,
            content: buffer.toString("base64"),
            branch,
            sha, // Pass the SHA if updating, undefined if creating
        });

        return NextResponse.json({
            message: `File ${file.name} uploaded successfully`,
            path: filePath
        });

    } catch (err: any) {
        console.error("Upload Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}