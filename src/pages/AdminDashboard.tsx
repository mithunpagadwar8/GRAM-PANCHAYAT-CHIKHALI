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
  // ------------------------------------------
  // ADD MEMBER
  // ------------------------------------------
  const addMember = async () => {
    if (!newMember.name || !newMember.position) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      name: newMember.name,
      position: newMember.position,
      photoUrl: newMember.photoUrl || "",
      createdAt: Date.now(),
    };

    setMembers(prev => [...prev, payload]);

    if (isConfigured()) {
      await addToCollection("members", payload);
    }

    setNewMember({
      id: "",
      name: "",
      position: "",
      photoUrl: "",
    });
  };

  // ------------------------------------------
  // BLOGS
  // ------------------------------------------
  const publishBlog = async () => {
    if (!newBlog.title || !newBlog.content) {
      alert("Please fill title & content");
      return;
    }

    const payload = {
      title: newBlog.title,
      content: newBlog.content,
      imageUrl: newBlog.imageUrl || "",
      createdAt: Date.now(),
    };

    setBlogs(prev => [...prev, payload]);

    if (isConfigured()) {
      await addToCollection("blogs", payload);
    }

    setNewBlog({
      title: "",
      content: "",
      imageUrl: "",
    });
  };

  const deleteBlog = (id: string) => {
    executeDelete("blogs", id, () =>
      setBlogs(prev => prev.filter(item => item.docId !== id))
    );
  };

  // ------------------------------------------
  // SCHEMES
  // ------------------------------------------
  const addNewScheme = async () => {
    if (!newScheme.title) return alert("Enter scheme title");

    const payload = {
      title: newScheme.title,
      description: newScheme.description,
      createdAt: Date.now(),
    };

    setSchemes(prev => [...prev, payload]);

    if (isConfigured()) {
      await addToCollection("schemes", payload);
    }

    setNewScheme({
      title: "",
      description: "",
    });
  };

  const deleteSchemeItem = (id: string) => {
    executeDelete("schemes", id, () =>
      setSchemes(prev => prev.filter(item => item.docId !== id))
    );
  };

  // ------------------------------------------
  // IMPORTANT LINKS
  // ------------------------------------------
  const addNewLink = async () => {
    if (!newLink.title || !newLink.url) {
      alert("Enter both link title & URL");
      return;
    }

    const payload = {
      title: newLink.title,
      url: newLink.url,
      createdAt: Date.now(),
    };

    setLinks(prev => [...prev, payload]);

    if (isConfigured()) {
      await addToCollection("links", payload);
    }

    setNewLink({
      title: "",
      url: "",
    });
  };

  const deleteImportantLink = (id: string) => {
    executeDelete("links", id, () =>
      setLinks(prev => prev.filter(item => item.docId !== id))
    );
  };

  // ------------------------------------------
  // TAX RECORDS
  // ------------------------------------------
  const addNewTaxRecord = async () => {
    if (!newTaxRecord.name || !newTaxRecord.amount) {
      alert("Fill all tax fields");
      return;
    }

    const payload = {
      name: newTaxRecord.name,
      amount: newTaxRecord.amount,
      status: newTaxRecord.status,
      createdAt: Date.now(),
    };

    setTaxRecords(prev => [...prev, payload]);

    if (isConfigured()) {
      await addToCollection("taxRecords", payload);
    }

    setNewTaxRecord({
      name: "",
      amount: "",
      status: "Pending",
    });
  };

  const deleteTaxRecord = (id: string) => {
    executeDelete("taxRecords", id, () =>
      setTaxRecords(prev => prev.filter(item => item.docId !== id))
    );
  };
  // ------------------------------------------
  // COMPLAINTS (Mark Resolved / Delete)
  // ------------------------------------------
  const markComplaintResolved = (id: string) => {
    executeUpdate(
      "complaints",
      id,
      { status: "Resolved" },
      () =>
        setComplaints &&
        setComplaints(prev =>
          prev.map(item =>
            item.docId === id ? { ...item, status: "Resolved" } : item
          )
        )
    );
  };

  const reopenComplaint = (id: string) => {
    executeUpdate(
      "complaints",
      id,
      { status: "Open" },
      () =>
        setComplaints &&
        setComplaints(prev =>
          prev.map(item =>
            item.docId === id ? { ...item, status: "Open" } : item
          )
        )
    );
  };

  const deleteComplaintItem = (id: string) => {
    executeDelete("complaints", id, () =>
      setComplaints &&
      setComplaints(prev =>
        prev.filter(item => item.docId !== id)
      )
    );
  };

  // ------------------------------------------
  // GALLERY IMAGE UPLOAD (Firebase Storage)
  // ------------------------------------------
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryImage, setNewGalleryImage] = useState("");

  const addGalleryImage = async () => {
    if (!newGalleryImage) return alert("Please upload image");

    const payload = {
      url: newGalleryImage,
      createdAt: Date.now(),
    };

    setGalleryImages(prev => [...prev, newGalleryImage]);

    if (isConfigured()) {
      await addToCollection("gallery", payload);
    }

    setNewGalleryImage("");
  };

  const deleteGalleryImage = (url: string) => {
    executeDelete("gallery", url, () =>
      setGalleryImages(prev => prev.filter(img => img !== url))
    );
  };
  // ------------------------------------------
  // RENDER UI
  // ------------------------------------------
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded mb-6"
      >
        Logout
      </button>

      {/* TABS */}
      <div className="flex gap-3 border-b pb-2 mb-4">
        {[
          "settings",
          "members",
          "blogs",
          "schemes",
          "links",
          "meetings",
          "tax",
          "complaints",
          "gallery",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ------------------- SETTINGS ------------------- */}
      {activeTab === "settings" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Website Settings</h2>

          <label>Logo URL</label>
          <input
            className="border p-2 w-full mb-2"
            value={settings.logoUrl}
            onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
          />

          <label>Panchayat Name</label>
          <input
            className="border p-2 w-full mb-2"
            value={settings.panchayatName}
            onChange={(e) =>
              setSettings({ ...settings, panchayatName: e.target.value })
            }
          />

          <label>Flag URL</label>
          <input
            className="border p-2 w-full mb-2"
            value={settings.flagUrl}
            onChange={(e) => setSettings({ ...settings, flagUrl: e.target.value })}
          />

          <label>Marquee Text</label>
          <textarea
            className="border p-2 w-full mb-2"
            value={settings.marqueeText}
            onChange={(e) =>
              setSettings({ ...settings, marqueeText: e.target.value })
            }
          />

          <button
            onClick={() => setSettings(settings)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Settings
          </button>
        </div>
      )}

      {/* ------------------- MEMBERS ------------------- */}
      {activeTab === "members" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Members</h2>

          <input
            placeholder="Name"
            className="border p-2 w-full mb-2"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
          />

          <input
            placeholder="Position"
            className="border p-2 w-full mb-2"
            value={newMember.position}
            onChange={(e) =>
              setNewMember({ ...newMember, position: e.target.value })
            }
          />

          {/* PHOTO UPLOAD */}
          <FileUpload onUpload={(url) => setNewMember({ ...newMember, photoUrl: url })} />

          <button
            onClick={addMember}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            Add Member
          </button>

          {/* MEMBER LIST */}
          <div className="mt-6">
            {members.map((m, i) => (
              <div key={i} className="border p-3 mb-2 flex justify-between">
                <div>
                  <p className="font-bold">{m.name}</p>
                  <p>{m.position}</p>
                </div>

                <button
                  onClick={() => deleteMember(m.docId)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------- BLOGS ------------------- */}
      {activeTab === "blogs" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Publish Blog</h2>

          <input
            placeholder="Title"
            className="border p-2 w-full mb-2"
            value={newBlog.title}
            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
          />

          <textarea
            placeholder="Content"
            className="border p-2 w-full mb-2"
            value={newBlog.content}
            onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
          />

          {/* Image Upload */}
          <FileUpload onUpload={(url) => setNewBlog({ ...newBlog, imageUrl: url })} />

          <button
            onClick={publishBlog}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Publish
          </button>

          {/* BLOG LIST */}
          <div className="mt-6">
            {blogs.map((b, i) => (
              <div key={i} className="border p-3 mb-2">
                <p className="font-bold">{b.title}</p>
                <button
                  onClick={() => deleteBlog(b.docId)}
                  className="bg-red-500 text-white px-3 py-1 rounded mt-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------- SCHEMES ------------------- */}
      {activeTab === "schemes" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Schemes</h2>

          <input
            placeholder="Scheme Title"
            className="border p-2 w-full mb-2"
            value={newScheme.title}
            onChange={(e) => setNewScheme({ ...newScheme, title: e.target.value })}
          />

          <textarea
            placeholder="Description"
            className="border p-2 w-full mb-2"
            value={newScheme.description}
            onChange={(e) =>
              setNewScheme({ ...newScheme, description: e.target.value })
            }
          />

          <button
            onClick={addNewScheme}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Scheme
          </button>

          <div className="mt-6">
            {schemes.map((s, i) => (
              <div key={i} className="border p-3 mb-2 flex justify-between">
                <div>{s.title}</div>

                <button
                  onClick={() => deleteSchemeItem(s.docId)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------- IMPORTANT LINKS ------------------- */}
      {activeTab === "links" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Important Links</h2>

          <input
            placeholder="Title"
            className="border p-2 w-full mb-2"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
          />

          <input
            placeholder="URL"
            className="border p-2 w-full mb-2"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
          />

          <button
            onClick={addNewLink}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Link
          </button>

          <div className="mt-6">
            {links.map((l, i) => (
              <div key={i} className="border p-3 mb-2 flex justify-between">
                <div>{l.title}</div>

                <button
                  onClick={() => deleteImportantLink(l.docId)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------- COMPLAINTS ------------------- */}
      {activeTab === "complaints" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Complaints</h2>

          {complaints?.map((c, i) => (
            <div key={i} className="border p-3 mb-2">
              <p className="font-bold">{c.name}</p>
              <p>{c.message}</p>
              <p>Status: {c.status}</p>

              {c.status === "Open" ? (
                <button
                  onClick={() => markComplaintResolved(c.docId)}
                  className="bg-green-600 text-white px-3 py-1 rounded mt-2"
                >
                  Mark Resolved
                </button>
              ) : (
                <button
                  onClick={() => reopenComplaint(c.docId)}
                  className="bg-yellow-500 text-black px-3 py-1 rounded mt-2"
                >
                  Reopen
                </button>
              )}

              <button
                onClick={() => deleteComplaintItem(c.docId)}
                className="bg-red-500 text-white px-3 py-1 rounded mt-2 ml-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ------------------- GALLERY ------------------- */}
      {activeTab === "gallery" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Gallery Images</h2>

          <FileUpload onUpload={(url) => setNewGalleryImage(url)} />

          <button
            onClick={addGalleryImage}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            Add Image
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {galleryImages.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} className="w-full rounded border" />

                <button
                  onClick={() => deleteGalleryImage(img)}
                  className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
