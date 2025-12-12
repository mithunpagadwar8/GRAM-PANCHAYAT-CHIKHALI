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
