"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { fmtBytes } from "../utils";
import { FileItem } from "@/lib/mockFiles";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
    existingFiles: FileItem[];
    onUpload: (files: File[], message: string, description: string) => Promise<void>;
}

export function UploadModal({ isOpen, onClose, currentPath, existingFiles, onUpload }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle Enter/Exit Animation
  useEffect(() => {
    if (isOpen) {
        setIsVisible(true);
    } else {
        const timer = setTimeout(() => setIsVisible(false), 300); 
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  // Calculate duplicates
  const duplicates = files.filter(f => existingFiles.some((ef: FileItem) => ef.name === f.name));
  const isDuplicate = duplicates.length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const newFiles = Array.from(e.target.files);
          setFiles(newFiles);
          // Auto-fill message if empty
          if (!message) {
              setMessage(newFiles.length === 1 
                  ? `Add ${newFiles[0].name}` 
                  : `Add ${newFiles.length} files`);
          }
      }
  };

  const removeFile = (index: number) => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      setFiles(newFiles);
      if (newFiles.length === 0) setMessage("");
  };

  const handleSubmit = async () => {
    if (files.length === 0 || !message) return;
    setIsUploading(true);
    await onUpload(files, message, description);
    setIsUploading(false);
    setFiles([]);
    setMessage("");
    setDescription("");
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ${isOpen ? "animate-fade-in" : "animate-fade-out"}`}>
      <div 
        className={`w-full max-w-lg rounded-xl surface-card p-6 shadow-2xl space-y-5 flex flex-col max-h-[90vh] ${isOpen ? "animate-zoom-in" : "animate-zoom-out"}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0">
          <h2 className="text-lg font-semibold text-white">Upload Assets</h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
             <span>Destination:</span>
             <span className="font-mono text-blue-400 bg-blue-400/10 px-1 rounded">/{currentPath || "root"}</span>
          </div>
        </div>

        <div className="space-y-2 shrink-0">
          <label className="block text-sm font-medium text-gray-300">File Selection</label>
          <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${files.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-default hover:border-gray-500'}`}>
            <input 
                type="file" 
                multiple 
                className="hidden" 
                id="file-upload" 
                onChange={handleFileChange} 
            />
            
            {files.length === 0 ? (
                <label htmlFor="file-upload" className="cursor-pointer text-center w-full">
                    <div className="size-10 bg-card rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                        <Icon className="size-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></Icon>
                    </div>
                    <span className="text-sm text-blue-400 hover:underline">Click to choose files</span>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop them here</p>
                </label>
            ) : (
                <div className="flex flex-col items-center gap-2 w-full">
                    <div className="text-sm text-green-400 font-medium">{files.length} files selected</div>
                    <label htmlFor="file-upload" className="text-xs text-gray-500 hover:text-white cursor-pointer underline">
                        Change selection
                    </label>
                </div>
            )}
          </div>
        </div>

        {/* File List (Scrollable) */}
        {files.length > 0 && (
            <div className="flex-1 overflow-y-auto border border-default rounded-md bg-background/50 min-h-0">
                <div className="divide-y divide-default/50">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 text-sm group">
                            <div className="size-8 bg-card rounded border border-default flex items-center justify-center shrink-0 text-[10px] text-gray-400 font-mono uppercase">
                                {file.name.split('.').pop()?.slice(0,3)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="truncate text-gray-200">{file.name}</div>
                                <div className="text-xs text-gray-500">{fmtBytes(file.size)}</div>
                            </div>
                            <button 
                                onClick={() => removeFile(i)}
                                className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Icon className="size-4"><path d="M18 6 6 18M6 6l12 12"/></Icon>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {isDuplicate && (
              <div className="shrink-0 flex items-start gap-2 p-3 rounded-md bg-yellow-900/20 border border-yellow-700/50 text-yellow-200 text-xs">
                  <Icon className="size-4 shrink-0 mt-0.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01"/></Icon>
                  <div>
                      <strong className="font-semibold">Overwrite Warning:</strong>
                      <p className="opacity-90 mt-0.5">
                          {duplicates.length} file(s) will overwrite existing assets (e.g. &quot;{duplicates[0].name}&quot;).
                      </p>
                  </div>
              </div>
        )}

        <div className="space-y-3 shrink-0">
            <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Commit Summary <span className="text-red-400">*</span></label>
                <input type="text" className="input-base" placeholder='e.g. "Add environment props"' value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
             <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Description (Optional)</label>
                <textarea className="input-base min-h-[60px]" placeholder="Add details..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-default shrink-0">
            <Button variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={files.length === 0 || !message || isUploading}>
                {isUploading ? "Committing..." : (isDuplicate ? "Commit Changes" : "Commit Files")}
            </Button>
        </div>
      </div>
    </div>
  );
}