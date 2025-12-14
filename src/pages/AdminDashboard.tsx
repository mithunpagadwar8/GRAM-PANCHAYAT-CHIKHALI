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

/* ================= TYPES ================= */

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

  blogs: BlogPost[];
  setBlogs: React.Dispatch<React.SetStateAction<BlogPost[]>>;

  schemes: Scheme[];
  setSchemes: React.Dispatch<React.SetStateAction<Scheme[]>>;

  meetings: MeetingRecord[];
  setMeetings: React.Dispatch<React.SetStateAction<MeetingRecord[]>>;

  links: ImportantLink[];
  setLinks: React.Dispatch<React.SetStateAction<ImportantLink[]>>;

  taxRecords: TaxRecord[];
  setTaxRecords: React.Dispatch<React.SetStateAction<TaxRecord[]>>;

  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;

  isCloudConnected: boolean;
}

/* ================= COMPONENT ================= */

export default function AdminDashboard({
  members,
  setMembers,
  settings,
  setSettings,
  blogs,
  setBlogs,
  schemes,
  setSchemes,
  isCloudConnected
}: AdminDashboardProps) {
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
          <button onClick={() => setSection("overview")} className="w-full text-left p-2 hover:bg-gray-800">
            Dashboard
          </button>
          <button onClick={() => setSection("hero")} className="w-full text-left p-2 hover:bg-gray-800">
            Hero Slider
          </button>
          <button onClick={() => setSection("blog")} className="w-full text-left p-2 hover:bg-gray-800">
            Blog / Notices
          </button>
          <button onClick={() => setSection("schemes")} className="w-full text-left p-2 hover:bg-gray-800">
            Schemes
          </button>
          <button onClick={() => setSection("pages")} className="w-full text-left p-2 hover:bg-gray-800">
            Pages
          </button>
          <button onClick={() => setSection("settings")} className="w-full text-left p-2 hover:bg-gray-800">
            Settings
          </button>
        </nav>

        <button
          onClick={logout}
          className="mt-6 bg-red-600 w-full p-2 rounded"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">
        {section === "overview" && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">
              Cloud Status:{" "}
              <span className={isCloudConnected ? "text-green-600" : "text-red-600"}>
                {isCloudConnected ? "Connected" : "Offline"}
              </span>
            </p>
          </div>
        )}

        {section === "hero" && (
          <HeroSliderManager
            images={settings.sliderImages}
            setSettings={setSettings}
          />
        )}

        {section === "blog" && (
          <BlogManager blogs={blogs} setBlogs={setBlogs} />
        )}

        {section === "schemes" && (
          <SchemesManager schemes={schemes} setSchemes={setSchemes} />
        )}

        {section === "pages" && <PagesManager />}

        {section === "settings" && (
          <SettingsManager settings={settings} setSettings={setSettings} />
        )}
      </main>
    </div>
  );
}
