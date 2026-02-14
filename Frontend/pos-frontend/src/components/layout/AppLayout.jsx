import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

const titleFromPath = (path) => {
  if (path.startsWith("/customers")) return "Customers";
  if (path.startsWith("/items")) return "Items";
  return "Orders";
};

export default function AppLayout() {
  const location = useLocation();
  const title = titleFromPath(location.pathname);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        <aside className="hidden w-72 shrink-0 border-r border-zinc-800 bg-zinc-950/60 backdrop-blur md:block">
          <Sidebar />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} />
          <div className="flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>

      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
