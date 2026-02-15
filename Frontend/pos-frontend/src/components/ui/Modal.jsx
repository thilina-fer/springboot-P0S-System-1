import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={-1}
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-950/60 px-5 py-4">
          <div className="min-w-0">
            <div className="text-xs text-zinc-400">NextGen POS</div>
            <div className="truncate text-base font-semibold">{title}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-200 transition hover:bg-zinc-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer ? (
          <div className="border-t border-zinc-800 bg-zinc-950/60 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

