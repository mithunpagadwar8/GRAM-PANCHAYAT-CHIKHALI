// ✅ FIXED App.tsx
// ✅ AdminDashboard default import fixed
// ✅ No TS2614 error
// ✅ Firebase + Router compatible

import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import { TaxPayment } from './pages/TaxPayment';
import { Complaint } from './pages/Complaint';
import { Blog } from './pages/Blog';
import { Schemes } from './pages/Schemes';
import { Meetings } from './pages/Meetings';
import { Contact } from './pages/Contact';

import {
  INITIAL_BLOGS,
  INITIAL_LINKS,
  INITIAL_MEETINGS,
  INITIAL_MEMBERS,
  INITIAL_SCHEMES,
  INITIAL_SETTINGS,
  INITIAL_TAX_RECORDS
} from './constants';

import {
  AppSettings,
  BlogPost,
  Complaint as ComplaintType,
  ImportantLink,
  MeetingRecord,
  Member,
  Scheme,
  TaxRecord
} from './types';

import { subscribeToCollection, addToCollection } from './services/db';
import { isConfigured } from './services/firebaseconfig';

function App() {
  // ================= STATE =================
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>(INITIAL_TAX_RECORDS);
  const [complaints, setComplaints] = useState<ComplaintType[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>(INITIAL_SCHEMES);
  const [meetings, setMeetings] = useState<MeetingRecord[]>(INITIAL_MEETINGS);
  const [links, setLinks] = useState<ImportantLink[]>(INITIAL_LINKS);

  const [isConnected, setIsConnected] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // ================= FIREBASE SYNC =================
  const connectToDatabase = useCallback(() => {
    if (!isConfigured()) {
      console.warn('Firebase not configured. Using demo data');
      return () => {};
    }

    setDbError(false);
    setIsConnected(true);

    const handleSyncError = (err: any) => {
      console.warn('Firestore sync error, switching to offline mode', err);
      setIsConnected(false);
      setDbError(true);
    };

    const unsubMembers = subscribeToCollection('members', (d) => setMembers(d.length ? d as Member[] : INITIAL_MEMBERS), handleSyncError);
    const unsubBlogs = subscribeToCollection('blogs', (d) => setBlogs(d.length ? d as BlogPost[] : INITIAL_BLOGS), handleSyncError);
    const unsubTax = subscribeToCollection('taxRecords', (d) => setTaxRecords(d.length ? d as TaxRecord[] : INITIAL_TAX_RECORDS), handleSyncError);
    const unsubComplaints = subscribeToCollection('complaints', (d) => setComplaints(d as ComplaintType[]), handleSyncError);
    const unsubSchemes = subscribeToCollection('schemes', (d) => setSchemes(d.length ? d as Scheme[] : INITIAL_SCHEMES), handleSyncError);
    const unsubMeetings = subscribeToCollection('meetings', (d) => setMeetings(d.length ? d as MeetingRecord[] : INITIAL_MEETINGS), handleSyncError);
    const unsubLinks = subscribeToCollection('links', (d) => setLinks(d.length ? d as ImportantLink[] : INITIAL_LINKS), handleSyncError);

    return () => {
      unsubMembers?.();
      unsubBlogs?.();
      unsubTax?.();
      unsubComplaints?.();
      unsubSchemes?.();
      unsubMeetings?.();
      unsubLinks?.();
    };
  }, [retryCount]);

  useEffect(() => {
    const cleanup = connectToDatabase();
    return () => cleanup?.();
  }, [connectToDatabase]);

  const handleRetry = () => {
    setDbError(false);
    setRetryCount((p) => p + 1);
  };

  const handleAddComplaint = (c: ComplaintType) => {
    if (isConfigured() && isConnected && !dbError) {
      addToCollection('complaints', c);
    } else {
      setComplaints((p) => [c, ...p]);
      alert('Offline mode: Complaint saved locally.');
    }
  };

  // ================= UI =================
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">

        {!isConfigured() && (
          <div className="bg-red-600 text-white text-center text-xs p-1 font-bold">
            DEMO MODE: Configure firebaseConfig.ts to enable Cloud Database & Storage
          </div>
        )}

        {dbError && (
          <div className="bg-yellow-500 text-black text-center text-xs p-2 font-bold flex justify-center items-center gap-2">
            <span>Firestore connection failed</span>
            <button onClick={handleRetry} className="bg-black text-white px-3 py-1 rounded">
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
                  members={members} setMembers={setMembers}
                  settings={settings} setSettings={setSettings}
                  taxRecords={taxRecords} setTaxRecords={setTaxRecords}
                  complaints={complaints} setComplaints={setComplaints}
                  blogs={blogs} setBlogs={setBlogs}
                  schemes={schemes} setSchemes={setSchemes}
                  meetings={meetings} setMeetings={setMeetings}
                  links={links} setLinks={setLinks}
                  isCloudConnected={isConnected && !dbError}
                />
              }
            />

            <Route path="/tax" element={<TaxPayment records={taxRecords} settings={settings} />} />
            <Route path="/complaint" element={<Complaint onSubmit={handleAddComplaint} />} />
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
