
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
  // State 
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  
  // Start with empty arrays. Only load INITIAL_DATA if NOT configured.
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

  // Realtime Cloud Sync Logic
  const connectToDatabase = useCallback(() => {
    // 1. OFFLINE / DEMO MODE CHECK
    if (!isConfigured()) {
      console.warn("Firebase not configured. Using Demo Data.");
      setMembers(INITIAL_MEMBERS);
      setBlogs(INITIAL_BLOGS);
      setTaxRecords(INITIAL_TAX_RECORDS);
      setSchemes(INITIAL_SCHEMES);
      setMeetings(INITIAL_MEETINGS);
      setLinks(INITIAL_LINKS);
      return () => {};
    }

    // 2. ONLINE MODE
    setDbError(false); // Reset error state on try
    setIsConnected(true); // Optimistically set connected

    const handleSyncError = (err: any) => {
        console.warn("Database Sync Failed", err);
        setIsConnected(false);
        setDbError(true);
        // Do NOT load INITIAL_DATA here. If sync fails, show error, don't show fake data.
    };

    // CRITICAL FIX: Removed fallback to INITIAL_DATA. 
    // If data is empty [], setMembers([]) should happen, NOT setMembers(INITIAL_MEMBERS).
    
    const unsubMembers = subscribeToCollection('members', (data) => setMembers(data as Member[]), handleSyncError);
    const unsubBlogs = subscribeToCollection('blogs', (data) => setBlogs(data as BlogPost[]), handleSyncError);
    const unsubTax = subscribeToCollection('taxRecords', (data) => setTaxRecords(data as TaxRecord[]), handleSyncError);
    const unsubComplaints = subscribeToCollection('complaints', (data) => setComplaints(data as ComplaintType[]), handleSyncError);
    const unsubSchemes = subscribeToCollection('schemes', (data) => setSchemes(data as Scheme[]), handleSyncError);
    const unsubMeetings = subscribeToCollection('meetings', (data) => setMeetings(data as MeetingRecord[]), handleSyncError);
    const unsubLinks = subscribeToCollection('links', (data) => setLinks(data as ImportantLink[]), handleSyncError);
    
    // Subscribe to Settings
    const unsubSettings = subscribeToDocument('settings', 'global', (data) => {
        if(data) setSettings({...INITIAL_SETTINGS, ...data}); 
    }, handleSyncError);

    // Return cleanup function
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
  }, [retryCount]); // Re-run when retryCount changes

  // Trigger connection on mount or retry
  useEffect(() => {
    const cleanup = connectToDatabase();
    return () => {
      if (cleanup) cleanup();
    };
  }, [connectToDatabase]);

  const handleRetry = () => {
      setDbError(false);
      setRetryCount(prev => prev + 1); // Trigger re-connection
  };

  const handleAddComplaint = (newComplaint: ComplaintType) => {
    if (isConfigured() && isConnected && !dbError) {
        addToCollection('complaints', newComplaint);
    } else {
        setComplaints(prev => [newComplaint, ...prev]); // Fallback
        alert("Offline Mode: Complaint saved locally.");
    }
  };

  // Wrapper for settings update
  const handleUpdateSettings = (newSettings: AppSettings) => {
      setSettings(newSettings); 
      if(isConfigured() && isConnected) {
          saveSettings(newSettings);
      }
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        {/* Status Banners */}
        {!isConnected && isConfigured() === false && (
            <div className="bg-red-600 text-white text-center text-xs p-1 font-bold z-50">
                DEMO MODE: Configure firebaseConfig.ts to enable Cloud Database & Storage.
            </div>
        )}
        
        {dbError && (
            <div className="bg-yellow-500 text-black text-center text-xs p-2 font-bold z-50 flex flex-col md:flex-row justify-center items-center gap-2">
                <span>
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    Connection Failed: Ensure "Firestore Database" is ENABLED in Firebase Console.
                </span>
                <button 
                    onClick={handleRetry} 
                    className="bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-800 transition"
                >
                    <i className="fas fa-sync-alt mr-1"></i> Retry Connection
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
                  settings={settings} setSettings={handleUpdateSettings}
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
