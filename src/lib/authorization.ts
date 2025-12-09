import { Octokit } from "octokit";

export async function userHasAccessToFile(fileId: number, supabase: any, octokit: Octokit) {
    try {
        const { data: fileData, error: fileError } = await supabase
            .from("files")
            .select()
            .eq("file_id", fileId);

        if (fileError) {
            throw { error: fileError.message, status: 404 };
        }

        const { data: repoData } = await octokit.request("GET /repositories/{repo_id}", {
            repo_id: fileData.repo_id
        });

        return { ok: true, repo: repoData };

    } catch (err) {
        throw err;
    }
}