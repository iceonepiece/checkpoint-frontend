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
    fixedFileName?: string; // NEW: If set, enables "Update Mode"
}

export function UploadModal({ isOpen, onClose, currentPath, existingFiles, onUpload, fixedFileName }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState("");

  // Handle Enter/Exit Animation & State Cleanup
  useEffect(() => {
    if (isOpen) {
        setIsVisible(true);
        // Pre-fill message for update mode
        if (fixedFileName) {
            setMessage(`Update ${fixedFileName}`);
        }
    } else {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setFiles([]);       
            setMessage("");     
            setDescription(""); 
            setError("");
        }, 300); 
        return () => clearTimeout(timer);
    }
  }, [isOpen, fixedFileName]);

  if (!isVisible) return null;

  // In Update Mode, we don't check duplicates because we INTEND to overwrite.
  // In Upload Mode, we check duplicates.
  const duplicates = !fixedFileName && files.filter(f => existingFiles.some((ef: FileItem) => ef.name === f.name));
  const isDuplicate = duplicates && duplicates.length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setError("");
      if (e.target.files && e.target.files.length > 0) {
          const selectedFiles = Array.from(e.target.files);

          // --- UPDATE MODE LOGIC ---
          if (fixedFileName) {
              if (selectedFiles.length > 1) {
                  setError("Please select only one file for update.");
                  return;
              }
              
              const file = selectedFiles[0];
              const targetExt = fixedFileName.split('.').pop()?.toLowerCase();
              const fileExt = file.name.split('.').pop()?.toLowerCase();

              if (targetExt && fileExt !== targetExt) {
                  setError(`Extension mismatch. Please upload a .${targetExt} file to match the current asset.`);
                  return;
              }

              // Replace list with single file
              setFiles([file]);
              if (!message || message.startsWith("Add ") || message.startsWith("Update ")) {
                   setMessage(`Update ${fixedFileName}`);
              }
              return;
          }

          // --- NORMAL UPLOAD MODE LOGIC ---
          const updatedFiles = [...files, ...selectedFiles];
          setFiles(updatedFiles);

          if (!message || message.startsWith("Add ")) {
              setMessage(updatedFiles.length === 1 
                  ? `Add ${updatedFiles[0].name}` 
                  : `Add ${updatedFiles.length} files`);
          }
      }
      e.target.value = "";
  };

  const removeFile = (index: number) => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      setFiles(newFiles);
      setError("");
      
      if (newFiles.length === 0 && !fixedFileName) {
          setMessage("");
      }
  };

  const handleSubmit = async () => {
    if (files.length === 0 || !message) return;
    setIsUploading(true);
    
    try {
        let finalFiles = files;

        // RENAME LOGIC: If updating, rename the file to match the asset ID
        if (fixedFileName && files.length === 1) {
            const original = files[0];
            // Create a new File object with the same content but the correct name
            const renamed = new File([original], fixedFileName, { type: original.type });
            finalFiles = [renamed];
        }

        await onUpload(finalFiles, message, description);
        onClose();
    } catch (err) {
        console.error(err);
        setError("Upload failed");
    } finally {
        setIsUploading(false);
    }
  };

  const title = fixedFileName ? "Update New Version" : "Upload Assets";
  const dropText = fixedFileName ? "Click to select replacement file" : "Click to choose files";

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ${isOpen ? "animate-fade-in" : "animate-fade-out"}`}>
      <div 
        className={`w-full max-w-lg rounded-xl surface-card p-6 shadow-2xl space-y-5 flex flex-col max-h-[90vh] ${isOpen ? "animate-zoom-in" : "animate-zoom-out"}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
             <span>Destination:</span>
             <span className="font-mono text-blue-400 bg-blue-400/10 px-1 rounded">/{currentPath || "root"}</span>
             {fixedFileName && <span className="text-gray-500">(Target: {fixedFileName})</span>}
          </div>
        </div>

        <div className="space-y-2 shrink-0">
          <label className="block text-sm font-medium text-gray-300">File Selection</label>
          <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${files.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-default hover:border-gray-500'}`}>
            <input 
                type="file" 
                multiple={!fixedFileName} 
                className="hidden" 
                id="file-upload" 
                onChange={handleFileChange} 
            />
            
            {files.length === 0 ? (
                <label htmlFor="file-upload" className="cursor-pointer text-center w-full">
                    <div className="size-10 bg-card rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                        <Icon className="size-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></Icon>
                    </div>
                    <span className="text-sm text-blue-400 hover:underline">{dropText}</span>
                    {!fixedFileName && <p className="text-xs text-gray-500 mt-1">or drag and drop them here</p>}
                </label>
            ) : (
                <div className="flex flex-col items-center gap-2 w-full">
                    <div className="text-sm text-green-400 font-medium">{files.length} file{files.length > 1 ? 's' : ''} selected</div>
                    <label htmlFor="file-upload" className="text-xs text-gray-500 hover:text-white cursor-pointer underline flex items-center gap-1">
                        <Icon className="size-3"><path d="M12 5v14M5 12h14"/></Icon>
                        {fixedFileName ? "Change file" : "Click to add more files"}
                    </label>
                </div>
            )}
          </div>
          {error && (
              <div className="text-xs text-red-400 mt-2">{error}</div>
          )}
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
                                <div className="truncate text-gray-200">
                                    {/* Show rename intent in UI */}
                                    {fixedFileName ? (
                                        <span>
                                            <span className="line-through text-gray-500">{file.name}</span>
                                            <span className="mx-2 text-blue-400">→</span>
                                            <span className="text-white">{fixedFileName}</span>
                                        </span>
                                    ) : file.name}
                                </div>
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
                          {duplicates ? duplicates.length : 0} file(s) will overwrite existing assets.
                      </p>
                  </div>
              </div>
        )}

        <div className="space-y-3 shrink-0">
            <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Commit Summary <span className="text-red-400">*</span></label>
                <input type="text" className="input-base" placeholder={fixedFileName ? 'e.g. "Fix texture seam"' : 'e.g. "Add assets"'} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
             <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Description (Optional)</label>
                <textarea className="input-base min-h-[60px]" placeholder="Add details..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-default shrink-0">
            <Button variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={files.length === 0 || !message || isUploading}>
                {isUploading ? "Committing..." : (fixedFileName || isDuplicate ? "Commit Changes" : "Commit Files")}
            </Button>
        </div>
      </div>
    </div>
  );
}