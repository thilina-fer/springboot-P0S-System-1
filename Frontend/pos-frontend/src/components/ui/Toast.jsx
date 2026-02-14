import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const iconByType = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const toneByType = {
  success: "border-zinc-800 bg-zinc-950/80 text-white",
  error: "border-red-800 bg-zinc-950/80 text-white",
  info: "border-zinc-800 bg-zinc-950/80 text-white",
};

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const Icon = iconByType[toast.type] || Info;

  return (
    <div className="fixed right-4 top-4 z-[60] w-[min(420px,calc(100vw-2rem))]">
      <div
        className={[
          "flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur",
          toneByType[toast.type] || toneByType.info,
        ].join(" ")}
      >
        <Icon className="mt-0.5 h-5 w-5 text-zinc-300" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{toast.message}</div>
          <div className="mt-0.5 text-xs text-zinc-400">UI Only</div>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 text-zinc-200 transition hover:bg-zinc-900"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
