
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { TaxPayment } from './pages/TaxPayment';
import { Complaint } from './pages/Complaint';
import { Blog } from './pages/Blog';
import { Schemes } from './pages/Schemes';
import { Meetings } from './pages/Meetings';
import { Contact } from './pages/Contact';

import { INITIAL_BLOGS, INITIAL_LINKS, INITIAL_MEETINGS, INITIAL_MEMBERS, INITIAL_SCHEMES, INITIAL_SETTINGS, INITIAL_TAX_RECORDS } from './constants';
import { AppSettings, BlogPost, Complaint as ComplaintType, ImportantLink, MeetingRecord, Member, Scheme, TaxRecord } from './types';
import { subscribeToCollection, addToCollection, subscribeToDocument, saveSettings } from './services/db';
import { isConfigured } from './firebaseConfig';

function App() {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  // Initialize with empty arrays to prevent flash of demo data if connected
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

  const connectToDatabase = useCallback(() => {
    if (!isConfigured()) {
      // If not configured, load demo data
      setMembers(INITIAL_MEMBERS);
      setBlogs(INITIAL_BLOGS);
      setTaxRecords(INITIAL_TAX_RECORDS);
      setSchemes(INITIAL_SCHEMES);
      setMeetings(INITIAL_MEETINGS);
      setLinks(INITIAL_LINKS);
      return () => {};
    }

    setDbError(false);
    setIsConnected(true);

    const handleSyncError = (err: any) => {
        console.warn("Database Sync Failed", err);
        setIsConnected(false);
        setDbError(true);
        // Fallback to demo data only on error
        setMembers(INITIAL_MEMBERS);
        setBlogs(INITIAL_BLOGS);
        // etc...
    };

    // FIXED: Directly set data. If empty [], it stays empty. No fallback to INITIAL_DATA.
    const unsubMembers = subscribeToCollection('members', (data) => setMembers(data as Member[]), handleSyncError);
    const unsubBlogs = subscribeToCollection('blogs', (data) => setBlogs(data as BlogPost[]), handleSyncError);
    const unsubTax = subscribeToCollection('taxRecords', (data) => setTaxRecords(data as TaxRecord[]), handleSyncError);
    const unsubComplaints = subscribeToCollection('complaints', (data) => setComplaints(data as ComplaintType[]), handleSyncError);
    const unsubSchemes = subscribeToCollection('schemes', (data) => setSchemes(data as Scheme[]), handleSyncError);
    const unsubMeetings = subscribeToCollection('meetings', (data) => setMeetings(data as MeetingRecord[]), handleSyncError);
    const unsubLinks = subscribeToCollection('links', (data) => setLinks(data as ImportantLink[]), handleSyncError);
    
    // Subscribe to Settings (Global Config)
    const unsubSettings = subscribeToDocument('settings', 'global', (data) => {
        if(data) setSettings({...INITIAL_SETTINGS, ...data}); 
    }, handleSyncError);
    
    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubBlogs) unsubBlogs();
      if (unsubTax) unsubTax();
      if (unsubComplaints) unsubComplaints();
      if (unsubSchemes) unsubSchemes();
      if (unsubMeetings) unsubMeetings();
      if (unsubLinks) unsubLinks();
      if (unsubSettings) unsubSettings();
    };
  }, [retryCount]);

  useEffect(() => {
    const cleanup = connectToDatabase();
    return () => {
      if (cleanup) cleanup();
    };
  }, [connectToDatabase]);

  const handleRetry = () => {
      setDbError(false);
      setRetryCount(prev => prev + 1);
  };

  const handleAddComplaint = (newComplaint: ComplaintType) => {
    if (isConfigured() && isConnected && !dbError) {
        addToCollection('complaints', newComplaint);
    } else {
        setComplaints(prev => [newComplaint, ...prev]);
        alert("Offline Mode: Complaint saved locally.");
    }
  };

  // Wrapper for settings update to sync to cloud
  const handleUpdateSettings = (newSettings: AppSettings) => {
      setSettings(newSettings); // Optimistic update
      if(isConfigured() && isConnected) {
          saveSettings(newSettings);
      }
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        {dbError && (
            <div className="bg-yellow-500 text-black text-center text-xs p-2 font-bold z-50 flex justify-center gap-2">
                <span><i className="fas fa-exclamation-triangle"></i> Database Connection Failed. Check Firebase Rules.</span>
                <button onClick={handleRetry} className="underline bg-black text-white px-2 rounded">Retry</button>
            </div>
        )}

        <Navbar logoUrl={settings.logoUrl} panchayatName={settings.panchayatName} flagUrl={settings.flagUrl} marqueeText={settings.marqueeText} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home settings={settings} members={members} links={links} notices={blogs} />} />
            <Route path="/admin" element={<AdminDashboard members={members} setMembers={setMembers} settings={settings} setSettings={handleUpdateSettings} taxRecords={taxRecords} setTaxRecords={setTaxRecords} complaints={complaints} setComplaints={setComplaints} blogs={blogs} setBlogs={setBlogs} schemes={schemes} setSchemes={setSchemes} meetings={meetings} setMeetings={setMeetings} links={links} setLinks={setLinks} isCloudConnected={isConnected && !dbError} />} />
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
