import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

import HeroSliderManager from "./admin/HeroSliderManager";
import PhotoGalleryManager from "./admin/PhotoGalleryManager";
import VideoGalleryManager from "./admin/VideoGalleryManager";
import NoticeManager from "./admin/NoticeManager";
import BlogManager from "./admin/BlogManager";


/**
 * =====================================================
 * ADMIN DASHBOARD – MASTER CMS CONTROLLER
 * YouTube-style | Future-proof | All Website Tabs
 * =====================================================
 */

type AdminSection =
  | "overview"
  | "hero"
  | "gallery"
  | "videos"
  | "notices"
  | "blog"
  | "schemes"
  | "meetings"
  | "tax"
  | "complaints"
  | "members"
  | "pages"
  | "settings";

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] =
    useState<AdminSection>("overview");

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-[#1e3a8a] text-white flex flex-col shadow-xl">
        <div className="p-5 text-xl font-bold border-b border-blue-900">
          Admin Panel
          <p className="text-sm font-normal text-blue-200">
            Gram Panchayat CMS
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <SidebarItem
            label="Overview"
            active={activeSection === "overview"}
            onClick={() => setActiveSection("overview")}
          />

          <SidebarGroup title="Website Content">
            <SidebarItem
              label="Hero Slider"
              active={activeSection === "hero"}
              onClick={() => setActiveSection("hero")}
            />
            <SidebarItem
              label="Photo Gallery"
              active={activeSection === "gallery"}
              onClick={() => setActiveSection("gallery")}
            />
            <SidebarItem
              label="Video Gallery"
              active={activeSection === "videos"}
              onClick={() => setActiveSection("videos")}
            />
            <SidebarItem
              label="Pages Content"
              active={activeSection === "pages"}
              onClick={() => setActiveSection("pages")}
            />
          </SidebarGroup>

          <SidebarGroup title="Information">
            <SidebarItem
              label="Notices / News"
              active={activeSection === "notices"}
              onClick={() => setActiveSection("notices")}
            />
            <SidebarItem
              label="Blog"
              active={activeSection === "blog"}
              onClick={() => setActiveSection("blog")}
            />
            <SidebarItem
              label="Schemes"
              active={activeSection === "schemes"}
              onClick={() => setActiveSection("schemes")}
            />
            <SidebarItem
              label="Meetings (Sabha)"
              active={activeSection === "meetings"}
              onClick={() => setActiveSection("meetings")}
            />
          </SidebarGroup>

          <SidebarGroup title="Operations">
            <SidebarItem
              label="Tax Management"
              active={activeSection === "tax"}
              onClick={() => setActiveSection("tax")}
            />
            <SidebarItem
              label="Complaints"
              active={activeSection === "complaints"}
              onClick={() => setActiveSection("complaints")}
            />
            <SidebarItem
              label="Members"
              active={activeSection === "members"}
              onClick={() => setActiveSection("members")}
            />
          </SidebarGroup>

          <SidebarItem
            label="Settings"
            active={activeSection === "settings"}
            onClick={() => setActiveSection("settings")}
          />
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 mt-auto bg-red-600 hover:bg-red-700 rounded-lg py-2 text-sm font-semibold"
        >
          Logout
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeSection === "overview" && <Section title="Dashboard Overview" />}
        {activeSection === "hero" && <Section title="Hero Slider Manager" />}
        {activeSection === "gallery" && <Section title="Photo Gallery Manager" />}
        {activeSection === "videos" && <Section title="Video Gallery Manager" />}
        {activeSection === "notices" && <Section title="Notices / News Manager" />}
        {activeSection === "blog" && <Section title="Blog Manager" />}
        {activeSection === "schemes" && <Section title="Schemes Manager" />}
        {activeSection === "meetings" && <Section title="Meetings Manager" />}
        {activeSection === "tax" && <Section title="Tax Management" />}
        {activeSection === "complaints" && <Section title="Complaints Manager" />}
        {activeSection === "members" && <Section title="Members Manager" />}
        {activeSection === "pages" && <Section title="Website Pages Content" />}
        {activeSection === "settings" && <Section title="Website Settings" />}
      </main>
    </div>
  );
};

export default AdminDashboard;

/* ================= REUSABLE COMPONENTS ================= */

const SidebarItem: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-6 py-2 text-sm transition ${
      active
        ? "bg-blue-600 font-semibold"
        : "hover:bg-blue-700 text-blue-100"
    }`}
  >
    {label}
  </button>
);

const SidebarGroup: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mt-3">
    <p className="px-6 text-xs uppercase text-blue-300 tracking-wide mb-1">
      {title}
    </p>
    {children}
  </div>
);

const Section: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white rounded-xl shadow p-6 min-h-[400px]">
    <h1 className="text-2xl font-bold mb-2">{title}</h1>
    <p className="text-gray-500">
      This module is ready. Advanced features (upload, edit, delete, CDN,
      Firebase) will be connected here.
    </p>
  </div>
);
