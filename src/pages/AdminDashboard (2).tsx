import React, { useEffect, useMemo, useState } from "react";
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
import { FileUpload } from "../components/FileUpload";
import {
  addToCollection,
  deleteFromCollection,
  updateInCollection,
} from "../services/db";
import { isConfigured, auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

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
  isCloudConnected,
}) => {
  // Auth
  const [admin, setAdmin] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAdmin(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  // UI State
  const [activeTab, setActiveTab] = useState<
    | "settings"
    | "members"
    | "blogs"
    | "schemes"
    | "links"
    | "meetings"
    | "tax"
    | "complaints"
    | "gallery"
  >("settings");

  // Members
  const [memberForm, setMemberForm] = useState<Partial<Member>>({
    name: "",
    mobile: "",
    position: "",
    type: "",
    photoUrl: "",
  });

  // Blogs
  const [blogForm, setBlogForm] = useState<Partial<BlogPost>>({
    title: "",
    content: "",
    mediaUrl: "",
    mediaType: "",
  });

  // Links / schemes / meetings / tax forms
  const [linkForm, setLinkForm] = useState<Partial<ImportantLink>>({
    title: "",
    url: "",
  });

  const [schemeForm, setSchemeForm] = useState<Partial<Scheme>>({
    title: "",
    description: "",
  });

  const [meetingForm, setMeetingForm] = useState<Partial<MeetingRecord>>({
    title: "",
    date: "",
    description: "",
  });

  const [taxForm, setTaxForm] = useState<Partial<TaxRecord>>({
    name: "",
    amount: "",
    status: "Pending",
  });

  // Gallery simple state
  const [gallery, setGallery] = useState<string[]>([]);

  // Generic optimistic helpers
  const executeDelete = (collection: string, id: string, localUpdate: () => void) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    localUpdate(); // optimistic
    if (isConfigured()) {
      deleteFromCollection(collection, id).catch((e) => {
        console.warn("Cloud delete failed", e);
        // could rollback or notify
      });
    }
  };

  const executeUpdate = async (
    collection: string,
    id: string,
    data: any,
    localUpdate: () => void
  ) => {
    if (isConfigured() && isCloudConnected) {
      await updateInCollection(collection, id, data).catch((e) => {
        console.error("Cloud update failed", e);
      });
    } else {
      localUpdate();
    }
  };

  // Members handlers
  const addMember = async () => {
    if (!memberForm.name || !memberForm.position) {
      alert("Please fill required fields");
      return;
    }
    const payload: Member = {
      id: Date.now().toString(),
      name: memberForm.name,
      mobile: memberForm.mobile || "",
      position: memberForm.position || "",
      type: memberForm.type || "",
      photoUrl: memberForm.photoUrl || "",
      createdAt: Date.now(),
    } as Member;

    setMembers((p) => [...p, payload]);
    if (isConfigured()) await addToCollection("members", payload);

    setMemberForm({ name: "", mobile: "", position: "", type: "", photoUrl: "" });
  };

  const deleteMember = (id: string) => {
    executeDelete("members", id, () => setMembers((p) => p.filter((x) => x.id !== id)));
  };

  // Blogs
  const publishBlog = async () => {
    if (!blogForm.title || !blogForm.content) return alert("Fill title & content");

    const payload: BlogPost = {
      id: Date.now().toString(),
      title: blogForm.title || "",
      content: blogForm.content || "",
      mediaUrl: blogForm.mediaUrl || "",
      mediaType: blogForm.mediaType || "",
      author: admin?.email || "Admin",
      publishDate: new Date().toISOString(),
    } as BlogPost;

    setBlogs((p) => [...p, payload]);
    if (isConfigured()) await addToCollection("blogs", payload);
    setBlogForm({ title: "", content: "", mediaUrl: "", mediaType: "" });
  };

  const deleteBlog = (id: string) => {
    executeDelete("blogs", id, () => setBlogs((p) => p.filter((b) => b.id !== id)));
  };

  // Schemes
  const addScheme = async () => {
    if (!schemeForm.title) return alert("Enter title");
    const payload: Scheme = {
      id: Date.now().toString(),
      name: schemeForm.title || "",
      title: schemeForm.title || "",
      description: schemeForm.description || "",
      eligibility: schemeForm.description || "",
    } as Scheme;

    setSchemes((p) => [...p, payload]);
    if (isConfigured()) await addToCollection("schemes", payload);
    setSchemeForm({ title: "", description: "" });
  };

  const deleteScheme = (id: string) => {
    executeDelete("schemes", id, () => setSchemes((p) => p.filter((s) => s.id !== id)));
  };

  // Links
  const addLink = async () => {
    if (!linkForm.title || !linkForm.url) return alert("Enter fields");
    const payload: ImportantLink = {
      id: Date.now().toString(),
      title: linkForm.title || "",
      url: linkForm.url || "",
      createdAt: Date.now(),
    } as ImportantLink;

    setLinks((p) => [...p, payload]);
    if (isConfigured()) await addToCollection("links", payload);
    setLinkForm({ title: "", url: "" });
  };

  const deleteLink = (id: string) => {
    executeDelete("links", id, () => setLinks((p) => p.filter((l) => l.id !== id)));
  };

  // Meetings
  const addMeeting = async () => {
    if (!meetingForm.title) return alert("Enter title");
    const payload: MeetingRecord = {
      id: Date.now().toString(),
      title: meetingForm.title || "",
      date: meetingForm.date || "",
      description: meetingForm.description || "",
    } as MeetingRecord;

    setMeetings((p) => [...p, payload]);
    if (isConfigured()) await addToCollection("meetings", payload);
    setMeetingForm({ title: "", date: "", description: "" });
  };

  const deleteMeeting = (id: string) => {
    executeDelete("meetings", id, () => setMeetings((p) => p.filter((m) => m.id !== id)));
  };

  // Tax
  const addTax = async () => {
    if (!taxForm.name || !taxForm.amount) return alert("Enter fields");
    const payload: TaxRecord = {
      id: Date.now().toString(),
      name: taxForm.name || "",
      amount: taxForm.amount || "",
      status: taxForm.status || "Pending",
      createdAt: Date.now(),
    } as TaxRecord;

    setTaxRecords((p) => [...p, payload]);
    if (isConfigured()) await addToCollection("taxRecords", payload);
    setTaxForm({ name: "", amount: "", status: "Pending" });
  };

  const deleteTax = (id: string) => {
    executeDelete("taxRecords", id, () => setTaxRecords((p) => p.filter((t) => t.id !== id)));
  };

  // Complaints
  const markComplaintResolved = (id: string) => {
    executeUpdate(
      "complaints",
      id,
      { status: "Resolved" },
      () =>
        setComplaints && setComplaints((p) => p.map((c) => (c.id === id ? { ...c, status: "Resolved" } : c)))
    );
  };

  const reopenComplaint = (id: string) => {
    executeUpdate(
      "complaints",
      id,
      { status: "Open" },
      () =>
        setComplaints && setComplaints((p) => p.map((c) => (c.id === id ? { ...c, status: "Open" } : c)))
    );
  };

  const deleteComplaint = (id: string) => {
    executeDelete("complaints", id, () => setComplaints && setComplaints((p) => p.filter((c) => c.id !== id)));
  };

  // Gallery
  const addGalleryImage = async (url: string) => {
    setGallery((p) => [...p, url]);
    if (isConfigured()) await addToCollection("gallery", { url, createdAt: Date.now() });
  };

  const deleteGalleryImage = (url: string) => {
    executeDelete("gallery", url, () => setGallery((p) => p.filter((g) => g !== url)));
  };

  // Settings update
  const saveSettingsHandler = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (isConfigured()) updateInCollection("settings", "global", newSettings).catch(() => {});
  };

  // Simple login form for admin (if needed)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      alert("Logged in");
    } catch (e) {
      alert("Login failed");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Memoized small UI pieces
  const tabs = useMemo(
    () => ["settings", "members", "blogs", "schemes", "links", "meetings", "tax", "complaints", "gallery"],
    []
  );

  if (loadingAuth) return <div className="p-4">Checking admin...</div>;
  if (!admin)
    return (
      <div className="mt-20 flex flex-col items-center">
        <h2 className="text-2xl font-bold">Admin Login</h2>
        <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email" className="border p-2 m-2" />
        <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" type="password" className="border p-2 m-2" />
        <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
      </div>
    );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex gap-3 border-b pb-3 mb-4">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={`px-3 py-1 rounded ${activeTab === t ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div>
            <h2 className="text-xl font-bold mb-3">Website Settings</h2>
            <label className="block">Panchayat Name</label>
            <input className="border p-2 w-full mb-2" value={settings.panchayatName} onChange={(e) => saveSettingsHandler({ ...settings, panchayatName: e.target.value })} />
            <label className="block">Logo URL</label>
            <input className="border p-2 w-full mb-2" value={settings.logoUrl} onChange={(e) => saveSettingsHandler({ ...settings, logoUrl: e.target.value })} />
            <label className="block">Marquee Text</label>
            <textarea className="border p-2 w-full mb-2" value={settings.marqueeText} onChange={(e) => saveSettingsHandler({ ...settings, marqueeText: e.target.value })} />
            <button onClick={() => saveSettingsHandler(settings)} className="bg-green-600 text-white px-4 py-2 rounded">Save Settings</button>
          </div>
        )}

        {/* MEMBERS */}
        {activeTab === "members" && (
          <div>
            <h2 className="text-xl font-bold mb-3">Add Member</h2>

            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Name" value={memberForm.name || ''} onChange={(e) => setMemberForm((p) => ({ ...p, name: e.target.value }))} className="border p-2" />
              <input placeholder="Position" value={memberForm.position || ''} onChange={(e) => setMemberForm((p) => ({ ...p, position: e.target.value }))} className="border p-2" />
              <input placeholder="Mobile" value={memberForm.mobile || ''} onChange={(e) => setMemberForm((p) => ({ ...p, mobile: e.target.value }))} className="border p-2" />
              <select value={memberForm.type || ''} onChange={(e) => setMemberForm((p) => ({ ...p, type: e.target.value }))} className="border p-2">
                <option value="">Select Type</option>
                <option value="Staff">Staff</option>
                <option value="Member">Member</option>
              </select>
            </div>

            <div className="mt-3">
              <FileUpload label="Profile Photo" accept="image/*" previewType="image" onFileSelect={(url) => setMemberForm((p) => ({ ...p, photoUrl: url }))} />
            </div>

            <button onClick={addMember} className="bg-orange-600 text-white px-6 py-2 rounded mt-3">Add Member</button>

            <div className="mt-6">
              {members.map((m) => (
                <div key={m.id} className="border p-3 mb-2 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{m.name}</p>
                    <p className="text-sm">{m.position} · {m.mobile}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => deleteMember(m.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOGS */}
        {activeTab === "blogs" && (
          <div>
            <h2 className="text-xl font-bold mb-3">Publish Blog</h2>
            <input placeholder="Title" value={blogForm.title || ''} onChange={(e) => setBlogForm((p) => ({ ...p, title: e.target.value }))} className="border p-2 w-full mb-2" />
            <textarea placeholder="Content" value={blogForm.content || ''} onChange={(e) => setBlogForm((p) => ({ ...p, content: e.target.value }))} className="border p-2 w-full mb-2" />
            <FileUpload label="Media (image/video)" accept="image/*,video/*" previewType="any" onFileSelect={(url, type) => setBlogForm((p) => ({ ...p, mediaUrl: url, mediaType: type.startsWith('video/') ? 'video' : 'image' }))} />
            <button onClick={publishBlog} className="bg-blue-600 text-white px-4 py-2 rounded">Publish</button>

            <div className="mt-6">
              {blogs.map((b) => (
                <div key={b.id} className="border p-3 mb-2">
                  <p className="font-bold">{b.title}</p>
                  <p className="text-sm">{b.publishDate}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => deleteBlog(b.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCHEMES */}
        {activeTab === "schemes" && (
          <div>
            <h2 className="text-xl font-bold mb-3">Schemes</h2>
            <input placeholder="Title" value={schemeForm.title || ''} onChange={(e) => setSchemeForm((p) => ({ ...p, title: e.target.value }))} className="border p-2 w-full mb-2" />
            <textarea placeholder="Description" value={schemeForm.description || ''} onChange={(e) => setSchemeForm((p) => ({ ...p, description: e.target.value }))} className="border p-2 w-full mb-2" />
            <button onClick={addScheme} className="bg-blue-600 text-white px-4 py-2 rounded">Add Scheme</button>

            <div className="mt-6">
              {schemes.map((s) => (
                <div key={s.id} className="border p-3 mb-2 flex justify-between">
                  <div>{s.name}</div>
                  <button onClick={() => deleteScheme(s.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LINKS */}
        {activeTab === "links" && (
          <div>
            <h2 className="text-xl font-bold mb-3">Links</h2>
            <input placeholder="Title" value={linkForm.title || ''} onChange={(e) => setLinkForm((p) => ({ ...p, title: e.target.value }))} className="border p-2 w-full mb-2" />
            <input placeholder="URL" value={linkForm.url || ''} onChange={(e) => setLinkForm((p) => ({ ...p, url: e.target.value }))} className="border p-2 w-full mb-2" />
            <button onClick={addLink} className="bg-blue-600 text-white px-4 py-2 rounded">Add Link</button>

            <div className="mt-6">
              {links.map((l) => (
                <div key={l.id} className="border p-3 mb-2 flex justify-between">
                  <div>{l.title}</div>
                  <button onClick={() => deleteLink(l.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEETINGS */}
        {activeTab === "meetings" && (
          <div>
            <h2 className="text-xl font-bold mb-3">Meetings</h2>
            <input placeholder="Title" value={meetingForm.title || ''} onChange={(e) => setMeetingForm((p) => ({ ...p, title: e.target.value }))} className="border p-2 w-full mb-2" />
            <input placeholder="Date" value={meetingForm.date || ''} onChange={(e) => setMeetingForm((p) => ({ ...p, date: e.target.value }))} className="border p-2 w-full mb-2" />
            <textarea placeholder="Description" value={meetingForm.description || ''} onChange={(e) => setMeetingForm((p) => ({ ...p, description: e.target.value }))} className="border p-2 w-full mb-2" />
            <button onClick={addMeeting} className="bg-blue-600 text-white px-4 py-2 rounded">Add Meeting</button>

            <div className="mt-6">
              {meetings.map((m) => (
                <div key={m.id} className="border p-3 mb-2 flex justify-between">
                  <div>{m.title} · {m.date}</div>
                  <button onClick={() => deleteMeeting(m.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAX */}
        {activeTab === "tax" && (
          <div>
            <h2 className="text-xl font-bold mb-3">Tax Records</h2>
            <input placeholder="Name" value={taxForm.name || ''} onChange={(e) => setTaxForm((p) => ({ ...p, name: e.target.value }))} className="border p-2 w-full mb-2" />
            <input placeholder="Amount" value={taxForm.amount || ''} onChange={(e) => setTaxForm((p) => ({ ...p, amount: e.target.value }))} className="border p-2 w-full mb-2" />
            <select value={taxForm.status || 'Pending'} onChange={(e) => setTaxForm((p) => ({...p, status: e.target.value}))} className="border p-2 w-full mb-2">
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
            <button onClick={addTax} className="bg-blue-600 text-white px-4 py-2 rounded">Add Tax Record</button>

            <div className="mt-6">
              {taxRecords.map((t) => (
                <div key={t.id} className="border p-3 mb-2 flex justify-between">
                  <div>{t.name} · {t.amount} · {t.status}</div>
                  <button onClick={() => deleteTax(t.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPLAINTS */}
        {activeTab === "complaints" && (
          <div>
            <h2 className="text-xl font-bold mb-3">Complaints</h2>
            {complaints?.map((c) => (
              <div key={c.id} className="border p-3 mb-2">
                <p className="font-bold">{c.name}</p>
                <p className="text-sm">{c.message}</p>
                <p className="text-xs mt-1">Status: {c.status}</p>
                <div className="mt-2 flex gap-2">
                  {c.status === 'Open' ? (
                    <button onClick={() => markComplaintResolved(c.id)} className="bg-green-600 text-white px-3 py-1 rounded">Resolve</button>
                  ) : (
                    <button onClick={() => reopenComplaint(c.id)} className="bg-yellow-500 text-black px-3 py-1 rounded">Reopen</button>
                  )}
                  <button onClick={() => deleteComplaint(c.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GALLERY */}
        {activeTab === "gallery" && (
          <div>
            <h2 className="text-xl font-bold mb-3">Gallery</h2>
            <FileUpload label="Upload Image" accept="image/*" previewType="image" onFileSelect={(url) => addGalleryImage(url)} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {gallery.map((g, i) => (
                <div key={i} className="relative">
                  <img src={g} className="w-full rounded" />
                  <button onClick={() => deleteGalleryImage(g)} className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded">X</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
