import React from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed";

const styles = {
  primary: "bg-white text-black hover:bg-zinc-200",
  secondary: "border border-zinc-800 bg-transparent text-white hover:bg-zinc-900/60",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "bg-transparent text-zinc-200 hover:bg-zinc-900/60 border border-transparent",
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button type={type} className={`${base} ${styles[variant]} ${className}`} {...props} />
  );
}
