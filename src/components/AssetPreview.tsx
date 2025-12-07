import React from "react";

type Props = { src?: string; type: string; alt?: string };

export default function AssetPreview({ src, type, alt }: Props) {
  const isImg = type.startsWith("image/");
  const isVideo = type.startsWith("video/");
  
  return (
    <div className="aspect-[16/10] w-full overflow-hidden rounded-md bg-background border border-default/50 grid place-items-center">
      {isImg && src ? (
        <img src={src} alt={alt ?? ""} className="h-full w-full object-contain" />
      ) : isVideo ? (
        <video src={src} controls className="h-full w-full" />
      ) : (
        <div className="text-gray-500 text-sm">No preview — {type}</div>
      )}
    </div>
  );
}