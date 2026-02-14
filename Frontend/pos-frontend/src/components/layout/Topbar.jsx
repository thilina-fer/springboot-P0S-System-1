import React from "react";
import { BadgeCheck } from "lucide-react";

export default function Topbar({ title }) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 md:px-6">
        <div className="min-w-0">
          <div className="text-xs text-zinc-400">NextGen POS</div>
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-300">
          <BadgeCheck className="h-4 w-4 text-zinc-400" />
          <span>UI Only</span>
        </div>
      </div>
    </header>
  );
}
