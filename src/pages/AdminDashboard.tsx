import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseconfig";

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
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="text-xl font-bold mb-6 text-center">Admin Panel</h2>
        <nav className="space-y-4">
          <button
            onClick={() => setSection("overview")}
            className="flex items-center p-2 w-full text-left text-lg hover:bg-gray-700 rounded-lg transition-all"
          >
            <i className="fas fa-tachometer-alt mr-3"></i> Dashboard
          </button>
          <button
            onClick={() => setSection("hero")}
            className="flex items-center p-2 w-full text-left text-lg hover:bg-gray-700 rounded-lg transition-all"
          >
            <i className="fas fa-images mr-3"></i> Hero Slider
          </button>
          <button
            onClick={() => setSection("blog")}
            className="flex items-center p-2 w-full text-left text-lg hover:bg-gray-700 rounded-lg transition-all"
          >
            <i className="fas fa-newspaper mr-3"></i> Blog / Notices
          </button>
          <button
            onClick={() => setSection("schemes")}
            className="flex items-center p-2 w-full text-left text-lg hover:bg-gray-700 rounded-lg transition-all"
          >
            <i className="fas fa-hand-holding-heart mr-3"></i> Schemes
          </button>
          <button
            onClick={() => setSection("pages")}
            className="flex items-center p-2 w-full text-left text-lg hover:bg-gray-700 rounded-lg transition-all"
          >
            <i className="fas fa-file-alt mr-3"></i> Pages
          </button>
          <button
            onClick={() => setSection("settings")}
            className="flex items-center p-2 w-full text-left text-lg hover:bg-gray-700 rounded-lg transition-all"
          >
            <i className="fas fa-cogs mr-3"></i> Settings
          </button>
        </nav>

        <button
          onClick={logout}
          className="mt-8 bg-red-600 w-full p-2 rounded-lg text-white hover:bg-red-700 transition-all"
        >
          <i className="fas fa-sign-out-alt mr-2"></i> Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {section === "overview" && (
          <div className="text-xl font-semibold text-center">Welcome to Admin Dashboard</div>
        )}
        {section === "hero" && <HeroSliderManager />}
        {section === "blog" && <BlogManager />}
        {section === "schemes" && <SchemesManager />}
        {section === "pages" && <PagesManager />}
        {section === "settings" && <SettingsManager />}
      </main>
    </div>
  );
}
