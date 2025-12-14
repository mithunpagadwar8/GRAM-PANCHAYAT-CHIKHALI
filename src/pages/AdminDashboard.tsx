import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseconfig";

import {
  Member,
  AppSettings,
  BlogPost,
  Scheme,
  MeetingRecord,
  ImportantLink,
  TaxRecord,
  Complaint
} from "../types";

// MANAGERS
import HeroSliderManager from "./admin/HeroSliderManager";
import BlogManager from "./admin/BlogManager";
import SchemesManager from "./admin/SchemesManager";
import PagesManager from "./admin/PagesManager";
import SettingsManager from "./admin/SettingsManager";

/**
 * =====================================================
 * ADMIN DASHBOARD – MASTER CMS
 * YouTube-style | Full Website Control
 * =====================================================
 */

type AdminSection =
  | "overview"
  | "hero"
  | "blog"
  | "schemes"
  | "pages"
  | "settings";

interface AdminDashboardProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;

  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;

  taxRecords: TaxRecord[];
  setTaxRecords: React.Dispatch<React.SetStateAction<TaxRecord[]>>;

  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;

  blogs: BlogPost[];
  setBlogs: React.Dispatch<React.SetStateAction<BlogPost[]>>;

  schemes: Scheme[];
  setSchemes: React.Dispatch<React.SetStateAction<Scheme[]>>;

  meetings: MeetingRecord[];
  setMeetings: React.Dispatch<React.SetStateAction<MeetingRecord[]>>;

  links: ImportantLink[];
  setLinks: React.Dispatch<React.SetStateAction<ImportantLink[]>>;

  isCloudConnected: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  members,
  settings,
  blogs,
  schemes,
  isCloudConnected,
}) => {
  const [section, setSection] = useState<AdminSection>("overview");

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-black text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-2">
          <button onClick={() => setSection("overview")} className="w-full text-left p-2 hover:bg-gray-800">Dashboard</button>
          <button onClick={() => setSection("hero")} className="w-full text-left p-2 hover:bg-gray-800">Hero Slider</button>
          <button onClick={() => setSection("blog")} className="w-full text-left p-2 hover:bg-gray-800">Blog / Notices</button>
          <button onClick={() => setSection("schemes")} className="w-full text-left p-2 hover:bg-gray-800">Schemes</button>
          <button onClick={() => setSection("pages")} className="w-full text-left p-2 hover:bg-gray-800">Pages</button>
          <button onClick={() => setSection("settings")} className="w-full text-left p-2 hover:bg-gray-800">Settings</button>
        </nav>

        <div className="mt-6 text-xs text-gray-400">
          Cloud Status: {isCloudConnected ? "🟢 Connected" : "🔴 Offline"}
        </div>

        <button
          onClick={logout}
          className="mt-6 bg-red-600 w-full p-2 rounded"
        >
          Logout
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-6">
        {section === "overview" && (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">
              Total Members: {members.length}
            </p>
            <p className="text-gray-600">
              Total Blogs / Notices: {blogs.length}
            </p>
            <p className="text-gray-600">
              Total Schemes: {schemes.length}
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
