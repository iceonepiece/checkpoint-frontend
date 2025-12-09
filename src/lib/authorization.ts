import { Octokit } from "octokit";
import { SupabaseClient } from "@supabase/supabase-js";

export async function userHasAccessToFile(fileId: number, supabase: SupabaseClient, octokit: Octokit) {
    try {
        const { data: fileData, error: fileError } = await supabase
            .from("files")
            .select()
            .eq("file_id", fileId);

        if (fileError) {
            throw { error: fileError.message, status: 404 };
        }

        // Check array emptiness
        if (!fileData || fileData.length === 0) {
             throw { error: "File not found", status: 404 };
        }

        const { data: repoData } = await octokit.request("GET /repositories/{repo_id}", {
            repo_id: fileData[0].repo_id
        });

        return { ok: true, repo: repoData };

    } catch (err) {
        throw err;
    }
}