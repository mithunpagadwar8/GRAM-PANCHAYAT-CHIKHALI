import React, { useState, useEffect } from 'react';
import {
  AppSettings,
  BlogPost,
  Complaint,
  ImportantLink,
  MeetingRecord,
  Member,
  Scheme,
  TaxRecord
} from "../types";

import { FileUpload } from "../components/FileUpload";
import {
  addToCollection,
  deleteFromCollection,
  updateInCollection
} from "../services/db";

import { isConfigured, auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User
} from "firebase/auth";

// ✅ Correct Props Interface (No Errors)
interface AdminDashboardProps {
  settings: AppSettings;
  setSettings: (newSettings: AppSettings) => void;

  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;

  taxRecords: TaxRecord[];
  setTaxRecords: React.Dispatch<React.SetStateAction<TaxRecord[]>>;

  complaints: Complaint[];
  setComplaints?: React.Dispatch<React.SetStateAction<Complaint[]>>;

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

// 🔥 Authentication State
export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  setSettings,
  members,
  setMembers,
  taxRecords,
  setTaxRecords,
  complaints,
  setComplaints,
  blogs,
  setBlogs,
  schemes,
  setSchemes,
  meetings,
  setMeetings,
  links,
  setLinks,
  isCloudConnected
}) => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAdmin(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);
  // -------------------------------
  // Admin Tabs UI
  // -------------------------------
  const [activeTab, setActiveTab] = useState("settings");

  // -------------------------------
  // LOCAL INPUT STATES
  // -------------------------------
  const [newMember, setNewMember] = useState<Member>({
    id: "",
    name: "",
    position: "",
    photoUrl: ""
  });

  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    imageUrl: "",
  });

  const [newScheme, setNewScheme] = useState({
    title: "",
    description: "",
  });

  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
  });

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    description: "",
  });

  const [newTaxRecord, setNewTaxRecord] = useState({
    name: "",
    amount: "",
    status: "Pending",
  });

  // ------------------------------------------
  // 🔥 DELETE & UPDATE HELPERS (Optimistic UI)
  // ------------------------------------------
  const executeDelete = (collection: string, docId: string, localUpdate: () => void) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    localUpdate(); // Optimistic Update

    if (isConfigured()) {
      deleteFromCollection(collection, docId).catch(() =>
        console.warn("Cloud delete failed. Check rules or network.")
      );
    }
  };

  const executeUpdate = async (
    collection: string,
    docId: string,
    data: any,
    localUpdate: () => void
  ) => {
    if (isConfigured() && isCloudConnected) {
      try {
        await updateInCollection(collection, docId, data);
      } catch (err) {
        console.error("Cloud update failed:", err);
      }
    } else {
      localUpdate(); // Offline fallback
    }
  };

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------
  const handleLogout = async () => {
    await signOut(auth);
  };

  // ------------------------------------------
  // ADMIN LOGIN
  // ------------------------------------------
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      alert("Login Successful");
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  if (loadingAuth) {
    return <div className="p-4 text-center font-bold">Checking Admin Access...</div>;
  }

  if (!admin) {
    return (
      <div className="flex flex-col items-center mt-20">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 m-2"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 m-2"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 px-4 py-2 text-white rounded mt-3"
        >
          Login
        </button>
      </div>
    );
  }
