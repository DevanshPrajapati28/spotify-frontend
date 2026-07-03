import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "./Player";
import RightSidebar from "./RightSidebar";
import TopNav from "./TopNav";

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden p-2 gap-2">
      <div className="flex flex-1 overflow-hidden gap-2">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 rounded-lg bg-neutral-900 overflow-y-auto relative flex flex-col">
          <TopNav />
          <div className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </div>
        </main>

        {/* Right Sidebar (Queue) */}
        <RightSidebar />
      </div>

      {/* Bottom Player */}
      <Player />
    </div>
  );
}
