"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) {
      setMessage("Please select a file");
      return;
    }
    if (!commitMessage.trim()) {
      setMessage("Please enter a commit message");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", commitMessage);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    setUploading(false);
    setMessage(json.message || "Uploaded!");
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Upload File to Repository</h2>

      <div style={{ marginTop: 20 }}>
        <label>Select File:</label>
        <br />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Commit Message:</label>
        <br />
        <input
          type="text"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="e.g., Add new image asset"
          style={{ width: 300, padding: 6 }}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{ marginTop: 20 }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}
