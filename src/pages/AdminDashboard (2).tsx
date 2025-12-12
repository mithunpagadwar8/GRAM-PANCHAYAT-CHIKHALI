import React, { useState, useEffect } from "react";
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
  createUserWithEmailAndPassword,
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
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("settings");

  // ----------------------------
  // AUTH STATE LISTENER
  // ----------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // ----------------------------
  // LOGIN HANDLER
  // ----------------------------
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
      alert("Logged in successfully");
    } catch (err: any) {
      alert("Login failed: " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // ----------------------------
  // OPTIMISTIC DELETE
  // ----------------------------
  const executeDelete = (
    collection: string,
    id: string,
    localUpdate: () => void
  ) => {
    if (!window.confirm("Delete this item?")) return;

    localUpdate(); // instant remove

    if (isConfigured()) {
      deleteFromCollection(collection, id).catch(() =>
        console.warn("Cloud delete failed")
      );
    }
  };

  // ----------------------------
  // CLOUD + LOCAL UPDATE
  // ----------------------------
  const executeUpdate = async (
    collection: string,
    id: string,
    data: any,
    localUpdate: () => void
  ) => {
    localUpdate(); // local instant

    if (isConfigured() && isCloudConnected) {
      await updateInCollection(collection, id, data);
    }
  };
  // ----------------------------
  // ADD MEMBER
  // ----------------------------
  const [newMember, setNewMember] = useState({
    name: "",
    position: "",
    mobile: "",
    type: "official",
    photoUrl: "",
  });

  const addMember = () => {
    const member: Member = {
      id: Date.now().toString(),
      ...newMember,
      createdAt: Date.now(),
    };

    setMembers((prev) => [member, ...prev]);

    if (isConfigured() && isCloudConnected) {
      addToCollection("members", member);
    }

    setNewMember({
      name: "",
      position: "",
      mobile: "",
      type: "official",
      photoUrl: "",
    });
  };

  const deleteMember = (id: string) => {
    executeDelete("members", id, () =>
      setMembers((prev) => prev.filter((m) => m.id !== id))
    );
  };

  // ----------------------------
  // ADD BLOG
  // ----------------------------
  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    imageUrl: "",
    mediaType: "image",
  });

  const addBlog = () => {
    const blog: BlogPost = {
      id: Date.now().toString(),
      ...newBlog,
      createdAt: Date.now(),
      publishDate: Date.now(),
      author: "Admin",
    };

    setBlogs((prev) => [blog, ...prev]);

    if (isConfigured() && isCloudConnected) {
      addToCollection("blogs", blog);
    }

    setNewBlog({
      title: "",
      content: "",
      imageUrl: "",
      mediaType: "image",
    });
  };

  const deleteBlog = (id: string) => {
    executeDelete("blogs", id, () =>
      setBlogs((prev) => prev.filter((b) => b.id !== id))
    );
  };

  // ----------------------------
  // ADD SCHEME
  // ----------------------------
  const [newScheme, setNewScheme] = useState({
    name: "",
    title: "",
    description: "",
    eligibility: "",
  });

  const addScheme = () => {
    const sc: Scheme = {
      id: Date.now().toString(),
      ...newScheme,
      createdAt: Date.now(),
    };

    setSchemes((prev) => [sc, ...prev]);

    if (isConfigured() && isCloudConnected) {
      addToCollection("schemes", sc);
    }

    setNewScheme({
      name: "",
      title: "",
      description: "",
      eligibility: "",
    });
  };

  const deleteScheme = (id: string) => {
    executeDelete("schemes", id, () =>
      setSchemes((prev) => prev.filter((s) => s.id !== id))
    );
  };
  // ----------------------------
  // ADD MEETING
  // ----------------------------
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    date: "",
  });

  const addMeeting = () => {
    const mt: MeetingRecord = {
      id: Date.now().toString(),
      ...newMeeting,
      createdAt: Date.now(),
    };

    setMeetings((prev) => [mt, ...prev]);

    if (isConfigured() && isCloudConnected) {
      addToCollection("meetings", mt);
    }

    setNewMeeting({
      title: "",
      description: "",
      date: "",
    });
  };

  const deleteMeeting = (id: string) => {
    executeDelete("meetings", id, () =>
      setMeetings((prev) => prev.filter((m) => m.id !== id))
    );
  };

  // ----------------------------
  // ADD IMPORTANT LINK
  // ----------------------------
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
  });

  const addLink = () => {
    const link: ImportantLink = {
      id: Date.now().toString(),
      ...newLink,
      createdAt: Date.now(),
    };

    setLinks((prev) => [link, ...prev]);

    if (isConfigured() && isCloudConnected) {
      addToCollection("links", link);
    }

    setNewLink({
      title: "",
      url: "",
    });
  };

  const deleteLink = (id: string) => {
    executeDelete("links", id, () =>
      setLinks((prev) => prev.filter((l) => l.id !== id))
    );
  };

  // ----------------------------
  // ADD TAX RECORD
  // ----------------------------
  const [newTax, setNewTax] = useState({
    ownerName: "",
    propertyId: "",
    mobile: "",
    amount: "",
    status: "pending",
  });

  const addTax = () => {
    const tax: TaxRecord = {
      id: Date.now().toString(),
      ...newTax,
      createdAt: Date.now(),
    };

    setTaxRecords((prev) => [tax, ...prev]);

    if (isConfigured() && isCloudConnected) {
      addToCollection("taxRecords", tax);
    }

    setNewTax({
      ownerName: "",
      propertyId: "",
      mobile: "",
      amount: "",
      status: "pending",
    });
  };

  const deleteTax = (id: string) => {
    executeDelete("taxRecords", id, () =>
      setTaxRecords((prev) => prev.filter((t) => t.id !== id))
    );
  };

  // ----------------------------
  // COMPLAINT DELETE
  // ----------------------------
  const deleteComplaintItem = (id: string) => {
    executeDelete("complaints", id, () =>
      setComplaints((prev) => prev.filter((c) => c.id !== id))
    );
  };
  // ----------------------------------------
  // SETTINGS FORM LOCAL STATE
  // ----------------------------------------
  const [localSettings, setLocalSettings] = useState(settings);

  const saveSettingsNow = () => {
    const updated = { ...localSettings };
    setSettings(updated);
  };

  // ----------------------------------------
  // RENDER UI
  // ----------------------------------------
  if (!currentUser) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-3">Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={loginPass}
          onChange={(e) => setLoginPass(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white p-2 w-full rounded"
        >
          Login
        </button>
      </div>
    );
  }

  // ----------------------------------------
  // ADMIN DASHBOARD SCREEN
  // ----------------------------------------
  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* ------------ TABS -------------- */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-4 border-b">
        {[
          "settings",
          "members",
          "blogs",
          "schemes",
          "meetings",
          "links",
          "tax",
          "complaints",
        ].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded ${
              activeTab === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ------------ SETTINGS TAB -------------- */}
      {activeTab === "settings" && (
        <div>
          <h3 className="font-bold mb-3">Website Settings</h3>

          <label className="block mb-1 font-semibold">Panchayat Name</label>
          <input
            className="border p-2 w-full mb-3"
            value={localSettings.panchayatName}
            onChange={(e) =>
              setLocalSettings((prev) => ({
                ...prev,
                panchayatName: e.target.value,
              }))
            }
          />

          <label className="block mb-1 font-semibold">Marquee Text</label>
          <input
            className="border p-2 w-full mb-3"
            value={localSettings.marqueeText}
            onChange={(e) =>
              setLocalSettings((prev) => ({
                ...prev,
                marqueeText: e.target.value,
              }))
            }
          />

          {/* ---- LOGO UPLOAD ---- */}
          <FileUpload
            label="Upload Logo"
            accept="image/*"
            previewType="image"
            onFileSelect={(url) =>
              setLocalSettings((prev) => ({ ...prev, logoUrl: url }))
            }
          />

          {/* ---- FLAG UPLOAD ---- */}
          <FileUpload
            label="Upload Flag"
            accept="image/*"
            previewType="image"
            onFileSelect={(url) =>
              setLocalSettings((prev) => ({ ...prev, flagUrl: url }))
            }
          />

          <button
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
            onClick={saveSettingsNow}
          >
            Save Settings
          </button>
        </div>
      )}
      {/* ------------ MEMBERS TAB -------------- */}
      {activeTab === "members" && (
        <div>
          <h3 className="text-lg font-bold mb-3">Add Member</h3>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Name"
            value={newMember.name}
            onChange={(e) =>
              setNewMember({ ...newMember, name: e.target.value })
            }
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Position"
            value={newMember.position}
            onChange={(e) =>
              setNewMember({ ...newMember, position: e.target.value })
            }
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Mobile"
            value={newMember.mobile}
            onChange={(e) =>
              setNewMember({ ...newMember, mobile: e.target.value })
            }
          />

          <FileUpload
            label="Upload Member Photo"
            previewType="image"
            accept="image/*"
            onFileSelect={(url) =>
              setNewMember({ ...newMember, photoUrl: url })
            }
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addMember}
          >
            Add Member
          </button>

          <h3 className="font-bold mt-6 mb-2">Members List</h3>

          {members.map((m) => (
            <div key={m.id} className="border p-3 rounded mb-2">
              <div className="font-bold">{m.name}</div>
              <div>{m.position}</div>
              <button
                className="bg-red-500 text-white px-3 py-1 text-sm rounded mt-2"
                onClick={() => deleteMember(m.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ------------ BLOGS TAB -------------- */}
      {activeTab === "blogs" && (
        <div>
          <h3 className="text-lg font-bold mb-3">Add Blog</h3>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Title"
            value={newBlog.title}
            onChange={(e) =>
              setNewBlog({ ...newBlog, title: e.target.value })
            }
          />

          <textarea
            className="border p-2 w-full mb-2"
            placeholder="Content"
            value={newBlog.content}
            onChange={(e) =>
              setNewBlog({ ...newBlog, content: e.target.value })
            }
          />

          <FileUpload
            label="Upload Blog Image / Video"
            accept="image/*,video/*"
            previewType="any"
            onFileSelect={(url) =>
              setNewBlog({ ...newBlog, imageUrl: url })
            }
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addBlog}
          >
            Add Blog
          </button>

          <h3 className="font-bold mt-6 mb-2">Blog Posts</h3>

          {blogs.map((b) => (
            <div key={b.id} className="border p-3 rounded mb-2">
              <div className="font-bold">{b.title}</div>
              <div className="text-sm">{b.content}</div>
              <button
                className="bg-red-500 text-white px-3 py-1 text-sm rounded mt-2"
                onClick={() => deleteBlog(b.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ------------ SCHEMES TAB -------------- */}
      {activeTab === "schemes" && (
        <div>
          <h3 className="text-lg font-bold mb-3">Add Scheme</h3>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Scheme Name"
            value={newScheme.name}
            onChange={(e) =>
              setNewScheme({ ...newScheme, name: e.target.value })
            }
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Title"
            value={newScheme.title}
            onChange={(e) =>
              setNewScheme({ ...newScheme, title: e.target.value })
            }
          />

          <textarea
            className="border p-2 w-full mb-2"
            placeholder="Description"
            value={newScheme.description}
            onChange={(e) =>
              setNewScheme({
                ...newScheme,
                description: e.target.value,
              })
            }
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Eligibility"
            value={newScheme.eligibility}
            onChange={(e) =>
              setNewScheme({
                ...newScheme,
                eligibility: e.target.value,
              })
            }
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addScheme}
          >
            Add Scheme
          </button>

          <h3 className="font-bold mt-6 mb-2">Schemes</h3>

          {schemes.map((s) => (
            <div key={s.id} className="border p-3 rounded mb-2">
              <div className="font-bold">{s.title || s.name}</div>
              <button
                className="bg-red-500 text-white px-3 py-1 text-sm rounded mt-2"
                onClick={() => deleteScheme(s.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ------------ MEETINGS TAB -------------- */}
      {activeTab === "meetings" && (
        <div>
          <h3 className="text-lg font-bold mb-3">Add Meeting</h3>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Title"
            value={newMeeting.title}
            onChange={(e) =>
              setNewMeeting({ ...newMeeting, title: e.target.value })
            }
          />

          <textarea
            className="border p-2 w-full mb-2"
            placeholder="Description"
            value={newMeeting.description}
            onChange={(e) =>
              setNewMeeting({
                ...newMeeting,
                description: e.target.value,
              })
            }
          />

          <input
            type="date"
            className="border p-2 w-full mb-2"
            value={newMeeting.date}
            onChange={(e) =>
              setNewMeeting({ ...newMeeting, date: e.target.value })
            }
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addMeeting}
          >
            Add Meeting
          </button>

          <h3 className="font-bold mt-6 mb-2">Meeting Records</h3>

          {meetings.map((m) => (
            <div key={m.id} className="border p-3 rounded mb-2">
              <div className="font-bold">{m.title}</div>
              <button
                className="bg-red-500 text-white px-3 py-1 text-sm mt-2 rounded"
                onClick={() => deleteMeeting(m.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ------------ LINKS TAB -------------- */}
      {activeTab === "links" && (
        <div>
          <h3 className="text-lg font-bold mb-3">Add Important Link</h3>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Title"
            value={newLink.title}
            onChange={(e) =>
              setNewLink({ ...newLink, title: e.target.value })
            }
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="URL"
            value={newLink.url}
            onChange={(e) =>
              setNewLink({ ...newLink, url: e.target.value })
            }
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addLink}
          >
            Add Link
          </button>

          <h3 className="font-bold mt-6 mb-2">Links</h3>

          {links.map((l) => (
            <div key={l.id} className="border p-3 rounded mb-2">
              <div className="font-bold">{l.title}</div>
              <button
                className="bg-red-500 text-white px-3 py-1 text-sm mt-2 rounded"
                onClick={() => deleteLink(l.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ------------ TAX TAB -------------- */}
      {activeTab === "tax" && (
        <div>
          <h3 className="text-lg font-bold mb-3">Add Tax Record</h3>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Owner Name"
            value={newTax.ownerName}
            onChange={(e) =>
              setNewTax({ ...newTax, ownerName: e.target.value })
            }
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Property ID"
            value={newTax.propertyId}
            onChange={(e) =>
              setNewTax({ ...newTax, propertyId: e.target.value })
            }
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Mobile"
            value={newTax.mobile}
            onChange={(e) =>
              setNewTax({ ...newTax, mobile: e.target.value })
            }
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Amount"
            value={newTax.amount}
            onChange={(e) =>
              setNewTax({ ...newTax, amount: e.target.value })
            }
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addTax}
          >
            Add Tax
          </button>

          <h3 className="font-bold mt-6 mb-2">Tax Records</h3>

          {taxRecords.map((t) => (
            <div key={t.id} className="border p-3 rounded mb-2">
              <div className="font-bold">{t.ownerName}</div>
              <button
                className="bg-red-500 text-white px-3 py-1 text-sm mt-2 rounded"
                onClick={() => deleteTax(t.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ------------ COMPLAINTS TAB -------------- */}
      {activeTab === "complaints" && (
        <div>
          <h3 className="text-lg font-bold mb-3">Complaints</h3>

          {complaints.map((c) => (
            <div key={c.id} className="border p-3 rounded mb-3">
              <div className="font-bold">{c.name || "Anonymous"}</div>
              <div className="text-sm">{c.message}</div>

              <button
                className="bg-red-500 text-white px-3 py-1 text-sm mt-2 rounded"
                onClick={() => deleteComplaintItem(c.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
