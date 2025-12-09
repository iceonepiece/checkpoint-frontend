import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { uploadMultipleFiles } from "@/lib/github/uploadMultipleFiles";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getLockStatus } from "@/lib/helpers";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> }
) {
    const formData = await req.formData();
    
    const files = formData.getAll("files") as File[];
    const message = formData.get("message") as string | null;
    const description = formData.get("description") as string | null;

    if (!files || files.length === 0) return NextResponse.json({ message: "No files received" }, { status: 400 });
    if (!message) return NextResponse.json({ message: "No commit message" }, { status: 400 });

    const auth = await authenticate();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { octokit, user } = auth;
    const { owner, repo } = await context.params;
    
    const search = req.nextUrl.searchParams;
    const currentPath = search.get("path") ?? "";
    const branch = search.get("branch") ?? "main";

    try {
        // 1. Get Repo ID for Lock Checking
        const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
        const repoId = repoData.id;

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // 2. Check Locks for all files being uploaded (overwritten)
        const lockedFiles: string[] = [];

        for (const file of files) {
            const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
            const { isLocked, lockedByUserId, lockedByUsername } = await getLockStatus(supabase, repoId, filePath);

            if (isLocked && lockedByUserId !== user.github_id) {
                lockedFiles.push(`${file.name} (locked by ${lockedByUsername})`);
            }
        }

        if (lockedFiles.length > 0) {
            return NextResponse.json({ 
                error: `Permission Denied. Cannot overwrite locked files: ${lockedFiles.join(", ")}` 
            }, { status: 403 });
        }

        // 3. Prepare and Upload
        const fullCommitMessage = description ? `${message}\n\n${description}` : message;
        
        const filesToCommit = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
                return { path: filePath, buffer: Buffer.from(arrayBuffer) };
            })
        );

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