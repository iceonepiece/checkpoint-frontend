"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { fmtBytes } from "../utils";
import { FileItem } from "@/lib/mockFiles";

export function UploadModal({ isOpen, onClose, currentPath, existingFiles, onUpload }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;
  const isDuplicate = file && existingFiles.some((f: FileItem) => f.name === file.name);

  const handleSubmit = async () => {
    if (!file || !message) return;
    setIsUploading(true);
    await onUpload(file, message, description);
    setIsUploading(false);
    setFile(null);
    setMessage("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl surface-card p-6 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
        {/* ... (Copy content from your previous UploadModal) ... */}
        <div>
          <h2 className="text-lg font-semibold text-white">Upload Asset</h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
             <span>Destination:</span>
             <span className="font-mono text-blue-400 bg-blue-400/10 px-1 rounded">/{currentPath || "root"}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">File Selection</label>
          <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${file ? 'border-green-500/50 bg-green-500/5' : 'border-default hover:border-gray-500'}`}>
            <input type="file" className="hidden" id="file-upload" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!message) setMessage(`Add ${f.name}`); } }} />
            
            {!file ? (
                <label htmlFor="file-upload" className="cursor-pointer text-center">
                    <div className="size-10 bg-card rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                        <Icon className="size-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></Icon>
                    </div>
                    <span className="text-sm text-blue-400 hover:underline">Click to choose a file</span>
                </label>
            ) : (
                <div className="w-full flex items-center gap-3">
                    <div className="size-10 bg-card rounded-lg border border-default flex items-center justify-center shrink-0 text-gray-300 font-bold text-xs uppercase">{file.name.split('.').pop()}</div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{file.name}</div>
                        <div className="text-xs text-gray-500">{fmtBytes(file.size)}</div>
                    </div>
                    <button onClick={() => setFile(null)} className="text-gray-500 hover:text-red-400 p-1"><Icon className="size-4"><path d="M18 6 6 18M6 6l12 12"/></Icon></button>
                </div>
            )}
          </div>
          {isDuplicate && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-yellow-900/20 border border-yellow-700/50 text-yellow-200 text-xs">
                  <Icon className="size-4 shrink-0 mt-0.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01"/></Icon>
                  <div>
                      <strong className="font-semibold">New Version Detected:</strong>
                      <p className="opacity-90 mt-0.5">A file named &quot;{file?.name}&quot; already exists here.</p>
                  </div>
              </div>
          )}
        </div>

        <div className="space-y-3">
            <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Commit Summary <span className="text-red-400">*</span></label>
                <input type="text" className="input-base" placeholder='e.g. "Update texture"' value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
             <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Description (Optional)</label>
                <textarea className="input-base min-h-[80px]" placeholder="Add details..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-default">
            <Button variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!file || !message || isUploading}>
                {isUploading ? "Committing..." : (isDuplicate ? "Commit Changes" : "Commit New File")}
            </Button>
        </div>
      </div>
    </div>
  );
}