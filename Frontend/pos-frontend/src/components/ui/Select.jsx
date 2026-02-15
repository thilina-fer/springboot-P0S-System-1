import React from "react";

export default function Select({
  label,
  hint,
  error,
  className = "",
  children,
  ...props
}) {
  return (
    <label className={`block ${className}`}>
      {label ? <div className="mb-2 text-xs font-medium text-zinc-300">{label}</div> : null}
      <select
        {...props}
        className={[
          "w-full appearance-none rounded-xl border bg-zinc-950/40 px-3 py-2.5 text-sm text-white outline-none transition",
          error ? "border-red-700 focus:border-red-600" : "border-zinc-800 focus:border-zinc-600",
        ].join(" ")}
      >
        {children}
      </select>
      {error ? <div className="mt-2 text-xs text-red-400">{error}</div> : null}
      {!error && hint ? <div className="mt-2 text-xs text-zinc-500">{hint}</div> : null}
    </label>
  );
}
