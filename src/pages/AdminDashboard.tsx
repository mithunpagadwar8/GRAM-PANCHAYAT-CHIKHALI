import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseconfig";

// ================= MANAGERS =================
import HeroSliderManager from "../admin/HeroSliderManager";
import BlogManager from "../admin/BlogManager";
import SchemesManager from "../admin/SchemesManager";
import PagesManager from "../admin/PagesManager";
import SettingsManager from "../admin/SettingsManager";

/**
 * =====================================================
 * ADMIN DASHBOARD – MASTER CMS CONTROLLER
 * YouTube-style | Future-proof | All Website Tabs
 * =====================================================
 */

type AdminSection =
  | "overview"
  | "hero"
  | "blog"
  | "schemes"
  | "pages"
  | "settings";

const AdminDashboard: React.FC = () => {
  const [section, setSection] = useState<AdminSection>("overview");

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-black text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">
          Admin Panel
        </h2>

        <nav className="flex-1 space-y-1">
          <SidebarButton label="Dashboard" onClick={() => setSection("overview")} />
          <SidebarButton label="Hero Slider" onClick={() => setSection("hero")} />
          <SidebarButton label="Blog / Notices" onClick={() => setSection("blog")} />
          <SidebarButton label="Schemes" onClick={() => setSection("schemes")} />
          <SidebarButton label="Pages Content" onClick={() => setSection("pages")} />
          <SidebarButton label="Settings" onClick={() => setSection("settings")} />
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 hover:bg-red-700 transition w-full p-2 rounded font-semibold"
        >
          Logout
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-6 overflow-y-auto">
        {section === "overview" && (
          <div className="text-2xl font-bold">
            Welcome to Admin Dashboard
            <p className="text-sm text-gray-500 mt-2">
              Manage complete website from here (YouTube-style CMS)
            </p>
          </div>
        )}

        {section === "hero" && <HeroSliderManager />}
        {section === "blog" && <BlogManager />}
        {section === "schemes" && <SchemesManager />}
        {section === "pages" && <PagesManager />}
        {section === "settings" && <SettingsManager />}
      </main>
    </div>
  );
};

export default AdminDashboard;

// ================= SMALL COMPONENT =================
interface SidebarButtonProps {
  label: string;
  onClick: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition"
  >
    {label}
  </button>
);
