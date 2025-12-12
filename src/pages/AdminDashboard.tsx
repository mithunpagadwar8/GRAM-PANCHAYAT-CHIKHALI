// src/pages/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FileUpload } from "../components/FileUpload";
import { isConfigured, auth } from "../firebaseConfig";
import {
  addToCollection,
  deleteFromCollection,
  updateInCollection,
  subscribeToCollection,
  subscribeToDocument,
} from "../services/db";
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
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { FiSearch } from "react-icons/fi";

/**
 * AdminDashboard - Full Government + YouTube Hybrid version
 * - Clean, typed, optimistic updates
 * - FileUpload (fast) integration via onFileSelect(url, type)
 * - Escape '>' in JSX properly where needed
 */

interface AdminDashboardProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;

  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;

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

const defaultMemberForm: Partial<Member> = {
  name: "",
  position: "",
  mobile: "",
  photoUrl: "",
  type: "Member",
};

const defaultBlogForm = {
  title: "",
  content: "",
  mediaUrl: "",
  mediaType: "image",
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  setSettings,
  members,
  setMembers,
  blogs,
  setBlogs,
  schemes,
  setSchemes,
  meetings,
  setMeetings,
  links,
  setLinks,
  taxRecords,
  setTaxRecords,
  complaints,
  setComplaints,
  isCloudConnected,
}) => {
  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI
  const tabs = useMemo(
    () => [
      "overview",
      "members",
      "blogs",
      "schemes",
      "meetings",
      "links",
      "tax",
      "complaints",
      "gallery",
      "settings",
    ],
    []
  );
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Forms & local states
  const [memberForm, setMemberForm] = useState<Partial<Member>>(defaultMemberForm);
  const [blogForm, setBlogForm] = useState<typeof defaultBlogForm>(defaultBlogForm);
  const [schemeForm, setSchemeForm] = useState<Partial<Scheme>>({ title: "", description: "" });
  const [meetingForm, setMeetingForm] = useState<Partial<MeetingRecord>>({ title: "", date: "", description: "" });
  const [linkForm, setLinkForm] = useState<Partial<ImportantLink>>({ title: "", url: "" });
  const [taxForm, setTaxForm] = useState<Partial<TaxRecord>>({ ownerName: "", propertyId: "", mobile: "", amount: "", status: "Pending" });

  // Gallery preview
  const [gallery, setGallery] = useState<string[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Helper: optimistic delete
  const executeDelete = (collection: string, idOrKey: string, localUpdate: () => void) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    localUpdate();
    if (isConfigured()) {
      deleteFromCollection(collection, idOrKey).catch((err) => {
        console.warn("Cloud delete failed", err);
        // Optionally trigger a reload or show toast
      });
    }
  };

  // Helper: optimistic update
  const executeUpdate = async (collection: string, idOrKey: string, data: any, localUpdate: () => void) => {
    localUpdate();
    if (isConfigured() && isCloudConnected) {
      try {
        await updateInCollection(collection, idOrKey, data);
      } catch (err) {
        console.error("Cloud update failed", err);
      }
    }
  };

  // Login handler
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setAuthError(err?.message || "Login failed");
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
  };

  // ---- Members CRUD ----
  const addMember = async () => {
    if (!memberForm.name || !memberForm.position) {
      alert("Please fill name and position");
      return;
    }
    const payload: Member = {
      id: Date.now().toString(),
      name: memberForm.name || "",
      position: memberForm.position || "",
      mobile: memberForm.mobile || "",
      photoUrl: memberForm.photoUrl || "",
      type: memberForm.type || "Member",
      createdAt: Date.now(),
    } as Member;

    setMembers((p) => [payload, ...p]);
    if (isConfigured() && isCloudConnected) await addToCollection("members", payload);
    setMemberForm(defaultMemberForm);
  };

  const removeMember = (id: string) => {
    executeDelete("members", id, () => setMembers((p) => p.filter((m) => m.id !== id)));
  };

  // ---- Blogs ----
  const publishBlog = async () => {
    if (!blogForm.title || !blogForm.content) {
      alert("Fill title and content");
      return;
    }
    const payload: BlogPost = {
      id: Date.now().toString(),
      title: blogForm.title,
      content: blogForm.content,
      mediaUrl: blogForm.mediaUrl || "",
      mediaType: blogForm.mediaType || "image",
      author: currentUser?.email || "Admin",
      publishDate: new Date().toISOString(),
      createdAt: Date.now(),
    } as BlogPost;

    setBlogs((p) => [payload, ...p]);
    if (isConfigured() && isCloudConnected) await addToCollection("blogs", payload);
    setBlogForm(defaultBlogForm);
  };

  const removeBlog = (id: string) => {
    executeDelete("blogs", id, () => setBlogs((p) => p.filter((b) => b.id !== id)));
  };

  // ---- Schemes ----
  const addScheme = async () => {
    if (!schemeForm.title) return alert("Enter scheme title");
    const payload: Scheme = {
      id: Date.now().toString(),
      name: schemeForm.title || "",
      title: schemeForm.title || schemeForm.name || "",
      description: schemeForm.description || "",
      eligibility: schemeForm.description || "",
      createdAt: Date.now(),
    } as Scheme;

    setSchemes((p) => [payload, ...p]);
    if (isConfigured() && isCloudConnected) await addToCollection("schemes", payload);
    setSchemeForm({ title: "", description: "" });
  };

  const removeScheme = (id: string) => {
    executeDelete("schemes", id, () => setSchemes((p) => p.filter((s) => s.id !== id)));
  };

  // ---- Meetings ----
  const addMeeting = async () => {
    if (!meetingForm.title) return alert("Enter meeting title");
    const payload: MeetingRecord = {
      id: Date.now().toString(),
      title: meetingForm.title || "",
      date: meetingForm.date || "",
      description: meetingForm.description || "",
      createdAt: Date.now(),
    } as MeetingRecord;

    setMeetings((p) => [payload, ...p]);
    if (isConfigured() && isCloudConnected) await addToCollection("meetings", payload);
    setMeetingForm({ title: "", date: "", description: "" });
  };

  const removeMeeting = (id: string) => {
    executeDelete("meetings", id, () => setMeetings((p) => p.filter((m) => m.id !== id)));
  };

  // ---- Links ----
  const addLink = async () => {
    if (!linkForm.title || !linkForm.url) return alert("Enter link");
    const payload: ImportantLink = { id: Date.now().toString(), title: linkForm.title || "", url: linkForm.url || "", createdAt: Date.now() } as ImportantLink;
    setLinks((p) => [payload, ...p]);
    if (isConfigured() && isCloudConnected) await addToCollection("links", payload);
    setLinkForm({ title: "", url: "" });
  };

  const removeLink = (id: string) => {
    executeDelete("links", id, () => setLinks((p) => p.filter((l) => l.id !== id)));
  };

  // ---- Tax ----
  const addTax = async () => {
    if (!taxForm.ownerName || !taxForm.amount) return alert("Enter tax details");
    const payload: TaxRecord = {
      id: Date.now().toString(),
      ownerName: taxForm.ownerName || "",
      propertyId: taxForm.propertyId || "",
      mobile: taxForm.mobile || "",
      amount: taxForm.amount || "",
      status: taxForm.status || "Pending",
      createdAt: Date.now(),
    } as TaxRecord;
    setTaxRecords((p) => [payload, ...p]);
    if (isConfigured() && isCloudConnected) await addToCollection("taxRecords", payload);
    setTaxForm({ ownerName: "", propertyId: "", mobile: "", amount: "", status: "Pending" });
  };

  const removeTax = (id: string) => {
    executeDelete("taxRecords", id, () => setTaxRecords((p) => p.filter((t) => t.id !== id)));
  };

  // ---- Complaints ----
  const removeComplaint = (id: string) => {
    executeDelete("complaints", id, () => setComplaints((p) => p.filter((c) => c.id !== id)));
  };

  const markComplaintResolved = (id: string) => {
    executeUpdate(
      "complaints",
      id,
      { status: "Resolved" },
      () => setComplaints((p) => p.map((c) => (c.id === id ? { ...c, status: "Resolved" } : c)))
    );
  };

  // ---- Gallery ----
  const addGalleryImage = async (url: string) => {
    setGallery((p) => [url, ...p]);
    if (isConfigured() && isCloudConnected) await addToCollection("gallery", { url, createdAt: Date.now() });
  };

  const removeGalleryImage = (url: string) => {
    executeDelete("gallery", url, () => setGallery((p) => p.filter((u) => u !== url)));
  };

  // ---- Settings ----
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const saveSettings = () => {
    setSettings(localSettings);
    if (isConfigured() && isCloudConnected) updateInCollection("settings", "global", localSettings).catch(() => {});
  };

  // Search helper for members (example)
  const filteredMembers = members.filter((m) => m.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  // early loading / auth UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gov-primary">
        <i className="fas fa-circle-notch fa-spin text-4xl"></i>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <i className="fas fa-shield-alt text-white text-3xl"></i>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Sign In</h2>
            <p className="text-gray-500 text-sm mt-1">Gram Panchayat Official Portal</p>
            {isConfigured() ? (
              <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded mt-2 inline-block border border-green-200">
                <i className="fas fa-lock mr-1"></i> Secured by Google Firebase
              </span>
            ) : (
              <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-1 rounded mt-2 inline-block">Cloud Config Missing</span>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="admin@example.com" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="••••••••" required />
            </div>

            {authError && (
              <div className="bg-red-50 text-red-800 text-sm p-3 rounded border border-red-200">
                <i className="fas fa-exclamation-triangle mr-2"></i> {authError}
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-md transition transform hover:-translate-y-0.5">
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400 border-t pt-4">
            <p className="mb-2"><strong>Trouble Logging in?</strong></p>

            <p className="text-sm">
              Go to{" "}
              <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline">
                Firebase Console {'>'} Authentication
              </a>{" "}
              to reset.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD START
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gov-primary text-white flex-shrink-0 flex flex-col hidden md:flex shadow-2xl z-20">
        <div className="p-6 border-b border-blue-800 font-bold text-lg flex items-center gap-2">
          <i className="fas fa-laptop-code"></i> Admin Panel
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Cloud Connected"></div>
        </div>

        <div className="px-6 py-4 border-b border-blue-800 bg-blue-900/50">
          <div className="text-xs text-blue-300 uppercase font-bold">Logged in as</div>
          <div className="text-sm font-bold truncate" title={currentUser.email || ""}>{currentUser.email}</div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === tab ? "bg-gov-secondary shadow-lg" : "hover:bg-blue-800"}`}
            >
              <i className="fas fa-circle-notch w-5 text-center" />
              {tab.toUpperCase()}
            </button>
          ))}
        </nav>

        <div className="p-4 bg-blue-900">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-300 hover:text-white transition">
            <i className="fas fa-sign-out-alt" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage content, uploads and site settings</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search members..." className="border p-2 rounded-lg" />
              </div>

              <div className="text-xs text-gray-500">{isCloudConnected ? "Cloud connected" : "Offline / Demo mode"}</div>
            </div>
          </header>

          {/* CONTENT PANES */}
          <section>
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">Members</h3>
                  <div className="text-2xl">{members.length}</div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">Blogs</h3>
                  <div className="text-2xl">{blogs.length}</div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">Gallery</h3>
                  <div className="text-2xl">{gallery.length}</div>
                </div>
              </div>
            )}

            {/* MEMBERS */}
            {activeTab === "members" && (
              <div>
                <div className="bg-white p-4 rounded shadow mb-4">
                  <h3 className="font-bold mb-2">Add Member</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input value={memberForm.name || ""} onChange={(e) => setMemberForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="border p-2 rounded" />
                    <input value={memberForm.position || ""} onChange={(e) => setMemberForm((p) => ({ ...p, position: e.target.value }))} placeholder="Position" className="border p-2 rounded" />
                    <input value={memberForm.mobile || ""} onChange={(e) => setMemberForm((p) => ({ ...p, mobile: e.target.value }))} placeholder="Mobile" className="border p-2 rounded" />
                  </div>

                  <div className="mt-3">
                    <FileUpload label="Upload Photo" accept="image/*" previewType="image" onFileSelect={(url) => setMemberForm((p) => ({ ...p, photoUrl: url }))} />
                  </div>

                  <div className="mt-3">
                    <button onClick={addMember} className="bg-blue-600 text-white px-4 py-2 rounded">Add Member</button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    Members List
                    <span className="ml-auto text-xs text-gray-500">{members.length} total</span>
                  </h3>

                  <div className="space-y-2">
                    {filteredMembers.map((m) => (
                      <div key={m.id} className="p-3 border rounded flex items-center justify-between">
                        <div>
                          <div className="font-bold">{m.name}</div>
                          <div className="text-sm text-gray-500">{m.position}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => removeMember(m.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BLOGS */}
            {activeTab === "blogs" && (
              <div>
                <div className="bg-white p-4 rounded shadow mb-4">
                  <h3 className="font-bold mb-2">Publish Blog</h3>
                  <input value={blogForm.title} onChange={(e) => setBlogForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="border p-2 rounded w-full mb-2" />
                  <textarea value={blogForm.content} onChange={(e) => setBlogForm((p) => ({ ...p, content: e.target.value }))} placeholder="Content" className="border p-2 rounded w-full mb-2" />

                  <FileUpload label="Image or Video (optional)" accept="image/*,video/*" previewType="any" onFileSelect={(url, type) => setBlogForm((p) => ({ ...p, mediaUrl: url, mediaType: type.startsWith("video/") ? "video" : "image" }))} />

                  <div>
                    <button onClick={publishBlog} className="bg-blue-600 text-white px-4 py-2 rounded">Publish</button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold mb-2">All Blogs</h3>
                  <div className="space-y-3">
                    {blogs.map((b) => (
                      <div key={b.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold">{b.title}</div>
                            <div className="text-xs text-gray-500">{b.publishDate}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => removeBlog(b.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                          </div>
                        </div>
                        {b.mediaUrl && b.mediaType === "image" && <img src={b.mediaUrl} alt={b.title} className="mt-3 max-h-48 rounded" />}
                        {b.mediaUrl && b.mediaType === "video" && <video src={b.mediaUrl} controls className="mt-3 max-h-48 rounded" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCHEMES */}
            {activeTab === "schemes" && (
              <div>
                <div className="bg-white p-4 rounded shadow mb-4">
                  <h3 className="font-bold mb-2">Add Scheme</h3>
                  <input value={schemeForm.title || ""} onChange={(e) => setSchemeForm((p) => ({ ...p, title: e.target.value }))} placeholder="Scheme Title" className="border p-2 rounded w-full mb-2" />
                  <textarea value={schemeForm.description || ""} onChange={(e) => setSchemeForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="border p-2 rounded w-full mb-2" />
                  <button onClick={addScheme} className="bg-blue-600 text-white px-4 py-2 rounded">Add Scheme</button>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold mb-2">Schemes</h3>
                  <div className="space-y-2">
                    {schemes.map((s) => (
                      <div key={s.id} className="p-3 border rounded flex items-center justify-between">
                        <div>
                          <div className="font-bold">{s.title || s.name}</div>
                          <div className="text-sm text-gray-500">{s.description}</div>
                        </div>
                        <div>
                          <button onClick={() => removeScheme(s.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MEETINGS */}
            {activeTab === "meetings" && (
              <div>
                <div className="bg-white p-4 rounded shadow mb-4">
                  <h3 className="font-bold mb-2">Add Meeting</h3>
                  <input value={meetingForm.title || ""} onChange={(e) => setMeetingForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="border p-2 rounded w-full mb-2" />
                  <input value={meetingForm.date || ""} onChange={(e) => setMeetingForm((p) => ({ ...p, date: e.target.value }))} type="date" className="border p-2 rounded w-full mb-2" />
                  <textarea value={meetingForm.description || ""} onChange={(e) => setMeetingForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="border p-2 rounded w-full mb-2" />
                  <button onClick={addMeeting} className="bg-blue-600 text-white px-4 py-2 rounded">Add Meeting</button>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold mb-2">Meetings</h3>
                  <div className="space-y-2">
                    {meetings.map((m) => (
                      <div key={m.id} className="p-3 border rounded flex items-center justify-between">
                        <div>
                          <div className="font-bold">{m.title}</div>
                          <div className="text-sm text-gray-500">{m.date}</div>
                        </div>
                        <div>
                          <button onClick={() => removeMeeting(m.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LINKS */}
            {activeTab === "links" && (
              <div>
                <div className="bg-white p-4 rounded shadow mb-4">
                  <h3 className="font-bold mb-2">Add Link</h3>
                  <input value={linkForm.title || ""} onChange={(e) => setLinkForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="border p-2 rounded w-full mb-2" />
                  <input value={linkForm.url || ""} onChange={(e) => setLinkForm((p) => ({ ...p, url: e.target.value }))} placeholder="URL" className="border p-2 rounded w-full mb-2" />
                  <button onClick={addLink} className="bg-blue-600 text-white px-4 py-2 rounded">Add Link</button>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold mb-2">Important Links</h3>
                  <div className="space-y-2">
                    {links.map((l) => (
                      <div key={l.id} className="p-3 border rounded flex items-center justify-between">
                        <div className="truncate">
                          <div className="font-bold">{l.title}</div>
                          <div className="text-xs text-gray-500">{l.url}</div>
                        </div>
                        <div>
                          <button onClick={() => removeLink(l.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAX */}
            {activeTab === "tax" && (
              <div>
                <div className="bg-white p-4 rounded shadow mb-4">
                  <h3 className="font-bold mb-2">Add Tax Record</h3>
                  <input value={taxForm.ownerName || ""} onChange={(e) => setTaxForm((p) => ({ ...p, ownerName: e.target.value }))} placeholder="Owner Name" className="border p-2 rounded w-full mb-2" />
                  <input value={taxForm.propertyId || ""} onChange={(e) => setTaxForm((p) => ({ ...p, propertyId: e.target.value }))} placeholder="Property ID" className="border p-2 rounded w-full mb-2" />
                  <input value={taxForm.mobile || ""} onChange={(e) => setTaxForm((p) => ({ ...p, mobile: e.target.value }))} placeholder="Mobile" className="border p-2 rounded w-full mb-2" />
                  <input value={taxForm.amount || ""} onChange={(e) => setTaxForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Amount" className="border p-2 rounded w-full mb-2" />
                  <button onClick={addTax} className="bg-blue-600 text-white px-4 py-2 rounded">Add Tax</button>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold mb-2">Tax Records</h3>
                  <div className="space-y-2">
                    {taxRecords.map((t) => (
                      <div key={t.id} className="p-3 border rounded flex items-center justify-between">
                        <div>
                          <div className="font-bold">{t.ownerName}</div>
                          <div className="text-sm text-gray-500">{t.amount} · {t.status}</div>
                        </div>
                        <div>
                          <button onClick={() => removeTax(t.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COMPLAINTS */}
            {activeTab === "complaints" && (
              <div>
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold mb-2">Complaints</h3>
                  <div className="space-y-3">
                    {complaints.map((c) => (
                      <div key={c.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold">{c.name || "Anonymous"}</div>
                            <div className="text-xs text-gray-500">{c.message}</div>
                          </div>
                          <div className="flex gap-2">
                            {c.status !== "Resolved" ? (
                              <button onClick={() => markComplaintResolved(c.id)} className="bg-green-600 text-white px-3 py-1 rounded">Resolve</button>
                            ) : (
                              <button onClick={() => executeUpdate("complaints", c.id, { status: "Open" }, () => setComplaints((p) => p.map(x => x.id === c.id ? { ...x, status: "Open" } : x)))} className="bg-yellow-500 text-black px-3 py-1 rounded">Reopen</button>
                            )}
                            <button onClick={() => removeComplaint(c.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GALLERY */}
            {activeTab === "gallery" && (
              <div>
                <div className="bg-white p-4 rounded shadow mb-4">
                  <h3 className="font-bold mb-2">Upload Gallery Image / Video</h3>
                  <FileUpload label="Choose file" accept="image/*,video/*" previewType="any" onFileSelect={(url) => addGalleryImage(url)} />
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold mb-2">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {gallery.map((g, i) => (
                      <div key={i} className="relative">
                        {/* image or video detection */}
                        {g.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={g} controls className="w-full rounded" />
                        ) : (
                          <img src={g} className="w-full rounded" />
                        )}
                        <button onClick={() => removeGalleryImage(g)} className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === "settings" && (
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold mb-3">Website Settings</h3>

                <label className="block text-xs font-semibold">Panchayat Name</label>
                <input value={localSettings.panchayatName} onChange={(e) => setLocalSettings((p) => ({ ...p, panchayatName: e.target.value }))} className="border p-2 rounded w-full mb-2" />

                <label className="block text-xs font-semibold">Marquee Text</label>
                <input value={localSettings.marqueeText} onChange={(e) => setLocalSettings((p) => ({ ...p, marqueeText: e.target.value }))} className="border p-2 rounded w-full mb-2" />

                <FileUpload label="Upload Logo" accept="image/*" previewType="image" onFileSelect={(url) => setLocalSettings((p) => ({ ...p, logoUrl: url }))} />
                <FileUpload label="Upload Flag" accept="image/*" previewType="image" onFileSelect={(url) => setLocalSettings((p) => ({ ...p, flagUrl: url }))} />

                <div className="mt-3">
                  <button onClick={saveSettings} className="bg-green-600 text-white px-4 py-2 rounded">Save Settings</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
