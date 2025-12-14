import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isConfigured } from "../../services/firebaseconfig";

/**
 * =====================================================
 * PAGES MANAGER – Static Pages CMS
 * Controls: Home / About / Contact / Any Static Page
 * =====================================================
 */

type PageKey = "home" | "about" | "contact";

interface PageData {
  title: string;
  content: string;
  updatedAt?: any;
}

const DEFAULT_PAGES: Record<PageKey, PageData> = {
  home: {
    title: "Welcome to Gram Panchayat",
    content: "Edit home page content here...",
  },
  about: {
    title: "About Gram Panchayat",
    content: "Edit about page content here...",
  },
  contact: {
    title: "Contact Information",
    content: "Edit contact page content here...",
  },
};

const PagesManager: React.FC = () => {
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [pageData, setPageData] = useState<PageData>(
    DEFAULT_PAGES["home"]
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ================= LOAD PAGE =================
  useEffect(() => {
    if (!isConfigured()) return;

    const loadPage = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "pages", activePage);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setPageData(snap.data() as PageData);
        } else {
          setPageData(DEFAULT_PAGES[activePage]);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [activePage]);

  // ================= SAVE PAGE =================
  const savePage = async () => {
    try {
      setSaving(true);
      const ref = doc(db, "pages", activePage);
      await setDoc(ref, {
        ...pageData,
        updatedAt: serverTimestamp(),
      });
      alert("✅ Page updated successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pages Manager</h1>

      {/* PAGE SELECTOR */}
      <div className="flex gap-3">
        {(["home", "about", "contact"] as PageKey[]).map((p) => (
          <button
            key={p}
            onClick={() => setActivePage(p)}
            className={`px-4 py-2 rounded ${
              activePage === p
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* EDITOR */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <input
              className="w-full border p-2 rounded font-bold"
              placeholder="Page Title"
              value={pageData.title}
              onChange={(e) =>
                setPageData({ ...pageData, title: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2 rounded min-h-[200px]"
              placeholder="Page Content (HTML / Text)"
              value={pageData.content}
              onChange={(e) =>
                setPageData({
                  ...pageData,
                  content: e.target.value,
                })
              }
            />

            <button
              disabled={saving}
              onClick={savePage}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Save Page
            </button>
          </>
        )}
      </div>

      {/* INFO */}
      <div className="text-xs text-gray-500">
        These pages are stored in Firestore collection:
        <b> pages/{activePage}</b>
      </div>
    </div>
  );
};

export default PagesManager;
