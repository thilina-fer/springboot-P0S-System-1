import React from "react";
import { NavLink } from "react-router-dom";
import { Package, ReceiptText, Users } from "lucide-react";

const NavItem = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
          "border border-transparent",
          isActive
            ? "bg-zinc-900/70 border-zinc-800 text-white shadow-sm"
            : "text-zinc-300 hover:bg-zinc-900/50 hover:text-white",
        ].join(" ")
      }
    >
      <Icon className="h-5 w-5 text-zinc-400 group-hover:text-white" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export default function Sidebar() {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold tracking-tight">NextGen POS</div>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-[11px] text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            UI Only
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <NavItem to="/orders" icon={ReceiptText} label="Orders" />
        <NavItem to="/customers" icon={Users} label="Customers" />
        <NavItem to="/items" icon={Package} label="Items" />
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-400">
          Premium black theme • local state only
        </div>
      </div>
    </div>
  );
}
