import type { Octokit } from "octokit";

type FileToCommit = {
  path: string;   // repo path, e.g. "images/foo.png"
  buffer: Buffer; // file content
};

export async function uploadMultipleFiles(opts: {
  octokit: Octokit;
  owner: string;
  repo: string;
  files: FileToCommit[];
  message: string;
  branch?: string;
}) {
  const { octokit, owner, repo, files, message } = opts;
  const branch = opts.branch ?? "main";

  if (files.length === 0) {
    throw new Error("No files provided to commit.");
  }

  // 1 Get current HEAD commit of the branch
  const ref = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });

  const latestCommitSha = ref.data.object.sha;

  // 2 Get the commit and its tree
  const commit = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  });

  const baseTreeSha = commit.data.tree.sha;

  // 3 For each file: create a blob and remember its sha + path
  const treeItems: {
    path: string;
    mode: "100644";
    type: "blob";
    sha: string;
  }[] = [];

  for (const file of files) {
    const blob = await octokit.rest.git.createBlob({
      owner,
      repo,
      content: file.buffer.toString("base64"),
      encoding: "base64",
    });

    treeItems.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blob.data.sha, // 🔥 important: use sha, not raw content
    });
  }

  // 4 Create a new tree that overlays these files on top of baseTree
  const newTree = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: treeItems,
  });

  // 5 Create a commit pointing to the new tree
  const newCommit = await octokit.rest.git.createCommit({
    owner,
    repo,
    message,
    tree: newTree.data.sha,
    parents: [latestCommitSha],
  });

  // 6 Move branch to new commit
  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommit.data.sha,
  });

  return {
    commitSha: newCommit.data.sha,
    files: files.map((f) => f.path),
  };
}
