"use client";

import React from "react";
import ThreeModelViewer from "@/components/ThreeModelViewer"
import { useState, useEffect } from "react";
import { Repo } from "@/lib/RepoContext"


type Props = { src?: string; type: string; alt?: string; content?: string; repo?: Repo };

export function githubContentToUrl(base64: string, mime = "text/plain") {
  const decoded = atob(base64);
  const bytes = new Uint8Array(decoded.length);

  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob); // <---- usable URL
}


export default function AssetPreview({ src, type, alt, content = "", repo }: Props) {
  const isImg = type.startsWith("image/");
  const isVideo = type.startsWith("video/");
  const isModel = type.startsWith("model/");
  const ext = type.split("/")[1]; 
  const [modelUrl, setModelUrl] = useState("");

  useEffect(() => {
    function load() {
      const url: string = githubContentToUrl(content);
      setModelUrl(url); // <--- update state
    }
    load();
  }, []);
  
  
  return (
    // UPDATED: 
    // 1. Removed 'aspect-[16/10]' so it doesn't force a specific rectangle shape.
    // 2. Added 'min-h-[400px]' to give it presence even if loading.
    // 3. Used flexbox to center the content naturally.
    <div className="w-full min-h-[400px] bg-[#0d1117] border border-default/50 rounded-md overflow-hidden flex items-center justify-center relative p-1">
      {isImg && src ? (
        // UPDATED: 
        // 1. 'max-h-[70vh]' ensures it doesn't take up more than 70% of the screen height.
        // 2. 'w-auto h-auto' allows the browser to respect natural aspect ratio.
        // 3. 'object-contain' is the safety net to ensure no cropping.
        // eslint-disable-next-line @next/next/no-img-element
        <img 
            src={src} 
            alt={alt ?? ""} 
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain shadow-sm" 
        />
      ) : isVideo ? (
        <video src={src} controls className="max-w-full max-h-[70vh] w-full" />
      ) : isModel ? (
              <ThreeModelViewer
                url={modelUrl}
                ext={ext.toLocaleLowerCase()}
                onThumbnail={(png) => {
                  //console.log("Generated thumbnail:", png);
                  //setThumb(png);
                }}
              />
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-500">
            <div className="size-12 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="size-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="text-sm">No preview available</div>
            <div className="text-xs opacity-40 font-mono">{type}</div>
        </div>
      )}
    </div>
  );
}