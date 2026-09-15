"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type GameFrameProps = {
  src: string;
  title: string;
};

export function GameFrame({ src, title }: GameFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    iframeRef.current?.focus();
  }, []);

  return (
    <div className="relative h-dvh w-full bg-black">
      <Link
        href="/"
        className="absolute top-1 left-1 z-10 lg:text-7xl md:text-6xl sm:text-5xl text-4xl blur-[0.5px]"
      >
        <span className="italic">🏡</span>
      </Link>
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        tabIndex={0}
        className="h-full w-full border-0"
        allow="autoplay"
      />
    </div>
  );
}
