import React from "react";
import { NavLink } from "react-router-dom";
import { Package, ReceiptText, Users } from "lucide-react";

const Item = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] transition",
        isActive ? "bg-zinc-900/70 text-white" : "text-zinc-400 hover:text-white",
      ].join(" ")
    }
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default function MobileNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] gap-2 px-3 py-3">
        <Item to="/orders" icon={ReceiptText} label="Orders" />
        <Item to="/customers" icon={Users} label="Customers" />
        <Item to="/items" icon={Package} label="Items" />
      </div>
    </div>
  );
}
