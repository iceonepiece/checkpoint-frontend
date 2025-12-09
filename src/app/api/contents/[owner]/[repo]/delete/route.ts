import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getLockStatus } from "@/lib/helpers";

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> }
) {
    const auth = await authenticate();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { octokit, user } = auth;
    const { owner, repo } = await context.params;

    try {
        const body = await req.json();
        const { paths, message } = body;

        if (!paths || !Array.isArray(paths) || paths.length === 0) {
            return NextResponse.json({ error: "No files specified" }, { status: 400 });
        }

        // 1. Get Repo ID
        const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
        const repoId = repoData.id;

        // 2. Check Locks for ALL files
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const lockedFiles: string[] = [];

        for (const path of paths) {
            const { isLocked, lockedByUserId, lockedByUsername } = await getLockStatus(supabase, repoId, path);
            
            // Rule: Cannot delete if locked by someone else
            // Even Owner cannot delete a file locked by someone else (must unlock first)
            if (isLocked && lockedByUserId !== user.github_id) {
                lockedFiles.push(`${path} (locked by ${lockedByUsername})`);
            }
        }

        if (lockedFiles.length > 0) {
            return NextResponse.json({ 
                error: `Permission Denied. The following files are locked: ${lockedFiles.join(", ")}` 
            }, { status: 403 });
        }

        // 3. Proceed with deletion
        const deletedFiles = [];
        const failedFiles = [];

        for (const filePath of paths) {
            try {
                const { data: fileData } = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: filePath,
                });

                if (Array.isArray(fileData)) {
                    failedFiles.push({ path: filePath, reason: "Is a directory" });
                    continue;
                }

                await octokit.rest.repos.deleteFile({
                    owner,
                    repo,
                    path: filePath,
                    message: message || `Delete ${filePath}`,
                    sha: fileData.sha,
                });

                deletedFiles.push(filePath);
            } catch (error) {
                console.error(`Failed to delete ${filePath}`, error);
                failedFiles.push({ path: filePath, reason: error });
            }
        }

        return NextResponse.json({
            success: true,
            deleted: deletedFiles,
            failed: failedFiles
        });

    } catch (err) {
        console.error("Delete API Error:", err);
        return NextResponse.json({ error: err }, { status: 500 });
    }
}