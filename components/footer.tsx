"use client";

import Link from "next/link";
import { Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-center">
      <div className="mx-auto max-w-md flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-1 w-full">
          <span>Made with</span>
          <Heart className="h-3 w-3 fill-current text-red-500" />
          <span>by Ansh</span>
        </div>
        <Link 
          href="https://github.com/BhattAnsh" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 hover:text-foreground transition-colors w-full"
        >
          <Github className="h-4 w-4" />
          <span>github.com/BhattAnsh</span>
        </Link>
      </div>
    </footer>
  );
}
