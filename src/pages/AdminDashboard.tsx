import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

// MANAGERS
import HeroSliderManager from "./admin/HeroSliderManager";
import BlogManager from "./admin/BlogManager";
import SchemesManager from "./admin/SchemesManager";
import PagesManager from "./admin/PagesManager";
import SettingsManager from "./admin/SettingsManager";

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

export default function AdminDashboard() {
  const [section, setSection] = useState<AdminSection>("overview");

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <button onClick={() => setSection("overview")} className="block w-full text-left p-2 hover:bg-gray-800">Dashboard</button>
          <button onClick={() => setSection("hero")} className="block w-full text-left p-2 hover:bg-gray-800">Hero Slider</button>
          <button onClick={() => setSection("blog")} className="block w-full text-left p-2 hover:bg-gray-800">Blog / Notices</button>
          <button onClick={() => setSection("schemes")} className="block w-full text-left p-2 hover:bg-gray-800">Schemes</button>
          <button onClick={() => setSection("pages")} className="block w-full text-left p-2 hover:bg-gray-800">Pages</button>
          <button onClick={() => setSection("settings")} className="block w-full text-left p-2 hover:bg-gray-800">Settings</button>
        </nav>
        <button onClick={logout} className="mt-6 bg-red-600 w-full p-2 rounded">Logout</button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">
        {section === "overview" && <div className="text-xl font-bold">Welcome to Admin Dashboard</div>}
        {section === "hero" && <HeroSliderManager />}
        {section === "blog" && <BlogManager />}
        {section === "schemes" && <SchemesManager />}
        {section === "pages" && <PagesManager />}
        {section === "settings" && <SettingsManager />}
      </main>
    </div>
  );
}
