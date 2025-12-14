import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseconfig";

import {
  AppSettings,
  BlogPost,
  Complaint,
  ImportantLink,
  MeetingRecord,
  Member,
  Scheme,
  TaxRecord,
} from "../types";

/**
 * =====================================================
 * ADMIN DASHBOARD – SAFE CORE VERSION
 * (Build-safe | Props-fixed | Vercel-safe)
 * =====================================================
 */

type Props = {
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
};

export default function AdminDashboard(props: Props) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "content" | "settings"
  >("dashboard");

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="w-full text-left p-2 hover:bg-gray-800 rounded"
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("content")}
            className="w-full text-left p-2 hover:bg-gray-800 rounded"
          >
            Website Content
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className="w-full text-left p-2 hover:bg-gray-800 rounded"
          >
            Settings
          </button>
        </nav>

        <button
          onClick={logout}
          className="mt-6 bg-red-600 hover:bg-red-700 w-full p-2 rounded"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">
        {activeTab === "dashboard" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Welcome Admin 👋</h1>
            <p className="text-gray-600">
              Cloud Status:{" "}
              {props.isCloudConnected ? "🟢 Connected" : "🔴 Offline"}
            </p>
          </div>
        )}

        {activeTab === "content" && (
          <div>
            <h2 className="text-xl font-bold mb-2">Content Management</h2>
            <p className="text-gray-600">
              Hero Slider, Blogs, Schemes, Pages will be enabled in next steps.
            </p>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className="text-xl font-bold mb-2">Website Settings</h2>
            <p className="text-gray-600">
              Logo, Name, Contact & System settings.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
