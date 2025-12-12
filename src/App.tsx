import React, { useState, useEffect, useCallback } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import TaxPayment from "./pages/TaxPayment";
import ComplaintPage from "./pages/Complaint";
import Blog from "./pages/Blog";
import Schemes from "./pages/Schemes";
import Meetings from "./pages/Meetings";
import Contact from "./pages/Contact";

import {
  INITIAL_BLOGS,
  INITIAL_LINKS,
  INITIAL_MEETINGS,
  INITIAL_MEMBERS,
  INITIAL_SCHEMES,
  INITIAL_SETTINGS,
  INITIAL_TAX_RECORDS,
} from "./constants";

import {
  AppSettings,
  BlogPost,
  Complaint as ComplaintType,
  ImportantLink,
  MeetingRecord,
  Member,
  Scheme,
  TaxRecord,
} from "./types";

import {
  subscribeToCollection,
  addToCollection,
  subscribeToDocument,
  saveSettings,
} from "./services/db";

import { isConfigured } from "./firebaseConfig";

function App() {
  /* -------------------- STATE -------------------- */
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  const [members, setMembers] = useState<Member[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [complaints, setComplaints] = useState<ComplaintType[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [links, setLinks] = useState<ImportantLink[]>([]);

  const [isConnected, setIsConnected] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  /* -------------------- FIREBASE SYNC -------------------- */
  const connectToDatabase = useCallback(() => {
    if (!isConfigured()) {
      console.warn("Firebase not configured. Using demo data.");

      setMembers(INITIAL_MEMBERS);
      setBlogs(INITIAL_BLOGS);
      setTaxRecords(INITIAL_TAX_RECORDS);
      setSchemes(INITIAL_SCHEMES);
      setMeetings(INITIAL_MEETINGS);
      setLinks(INITIAL_LINKS);

      return () => {};
    }

    setIsConnected(true);
    setDbError(false);

    const onError = (err: any) => {
      console.error("Firestore error:", err);
      setIsConnected(false);
      setDbError(true);
    };

    const unsubMembers = subscribeToCollection("members", d => setMembers(d as Member[]), onError);
    const unsubBlogs = subscribeToCollection("blogs", d => setBlogs(d as BlogPost[]), onError);
    const unsubTax = subscribeToCollection("taxRecords", d => setTaxRecords(d as TaxRecord[]), onError);
    const unsubComplaints = subscribeToCollection("complaints", d => setComplaints(d as ComplaintType[]), onError);
    const unsubSchemes = subscribeToCollection("schemes", d => setSchemes(d as Scheme[]), onError);
    const unsubMeetings = subscribeToCollection("meetings", d => setMeetings(d as MeetingRecord[]), onError);
    const unsubLinks = subscribeToCollection("links", d => setLinks(d as ImportantLink[]), onError);

    const unsubSettings = subscribeToDocument(
      "settings",
      "global",
      d => d && setSettings({ ...INITIAL_SETTINGS, ...d }),
      onError
    );

    return () => {
      unsubMembers?.();
      unsubBlogs?.();
      unsubTax?.();
      unsubComplaints?.();
      unsubSchemes?.();
      unsubMeetings?.();
      unsubLinks?.();
      unsubSettings?.();
    };
  }, [retryCount]);

  useEffect(() => {
    const cleanup = connectToDatabase();
    return () => cleanup?.();
  }, [connectToDatabase]);

  /* -------------------- HELPERS -------------------- */
  const handleRetry = () => setRetryCount(p => p + 1);

  const handleAddComplaint = (c: ComplaintType) => {
    if (isConfigured() && isConnected && !dbError) {
      addToCollection("complaints", c);
    } else {
      setComplaints(prev => [c, ...prev]);
      alert("Offline mode: complaint saved locally.");
    }
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (isConfigured() && isConnected) {
      saveSettings(newSettings);
    }
  };

  /* -------------------- RENDER -------------------- */
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        {!isConnected && !isConfigured() && (
          <div className="bg-red-600 text-white text-xs text-center p-2">
            DEMO MODE — Firebase not configured
          </div>
        )}

        {dbError && (
          <div className="bg-yellow-500 text-black text-xs text-center p-2">
            Firestore connection failed
            <button
              onClick={handleRetry}
              className="ml-3 px-2 py-1 bg-black text-white rounded"
            >
              Retry
            </button>
          </div>
        )}

        <Navbar
          logoUrl={settings.logoUrl}
          panchayatName={settings.panchayatName}
          flagUrl={settings.flagUrl}
          marqueeText={settings.marqueeText}
        />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home settings={settings} members={members} links={links} notices={blogs} />} />

            <Route
              path="/admin"
              element={
                <AdminDashboard
                  members={members}
                  setMembers={setMembers}
                  settings={settings}
                  setSettings={handleUpdateSettings}
                  taxRecords={taxRecords}
                  setTaxRecords={setTaxRecords}
                  complaints={complaints}
                  setComplaints={setComplaints}
                  blogs={blogs}
                  setBlogs={setBlogs}
                  schemes={schemes}
                  setSchemes={setSchemes}
                  meetings={meetings}
                  setMeetings={setMeetings}
                  links={links}
                  setLinks={setLinks}
                  isCloudConnected={isConnected && !dbError}
                />
              }
            />

            <Route path="/tax" element={<TaxPayment records={taxRecords} settings={settings} />} />
            <Route path="/complaint" element={<ComplaintPage onSubmit={handleAddComplaint} />} />
            <Route path="/blog" element={<Blog posts={blogs} />} />
            <Route path="/schemes" element={<Schemes schemes={schemes} />} />
            <Route path="/meetings" element={<Meetings meetings={meetings} />} />
            <Route path="/contact" element={<Contact settings={settings} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
