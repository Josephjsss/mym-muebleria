"use client";

import { useRef } from "react";
import { Maximize2 } from "lucide-react";

type FullscreenVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitRequestFullscreen?: () => void;
};

export function VideoPlayer({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleExpand = () => {
    const video = videoRef.current as FullscreenVideo | null;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      // iOS Safari solo soporta pantalla completa nativa del <video>.
      video.webkitEnterFullscreen();
    }
  };

  return (
    <div className="group relative">
      <video
        ref={videoRef}
        controls
        loop
        autoPlay
        muted
        playsInline
        preload="auto"
        poster={poster}
        className={className}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={handleExpand}
        aria-label="Ver video en pantalla completa"
        className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-black/80"
      >
        <Maximize2 className="size-4" />
      </button>
    </div>
  );
}
