import React, { useEffect, useState } from "react";
import { collection, addDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

/**
 * =====================================================
 * PAGES MANAGER – Static Pages CMS
 * Home / About / Contact / Any custom page
 * =====================================================
 */

interface PageContent {
  id: string;
  slug: string; // home, about, contact
  title: string;
  content: string;
  updatedAt: number;
}

const PagesManager: React.FC = () => {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [slug, setSlug] = useState("home");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pages"), snap => {
      setPages(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  const savePage = async () => {
    if (!slug || !title) return alert("Slug & title required");

    if (selectedId) {
      await updateDoc(doc(db, "pages", selectedId), {
        slug,
        title,
        content,
        updatedAt: Date.now()
      });
    } else {
      await addDoc(collection(db, "pages"), {
        slug,
        title,
        content,
        updatedAt: Date.now()
      });
    }

    setSlug("home");
    setTitle("");
    setContent("");
    setSelectedId(null);
  };

  const editPage = (p: PageContent) => {
    setSelectedId(p.id);
    setSlug(p.slug);
    setTitle(p.title);
    setContent(p.content);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📄 Pages Manager</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <select
          className="border p-2 w-full mb-2"
          value={slug}
          onChange={e => setSlug(e.target.value)}
        >
          <option value="home">Home</option>
          <option value="about">About</option>
          <option value="contact">Contact</option>
          <option value="custom">Custom Page</option>
        </select>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Page title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-2 h-40"
          placeholder="Page content (HTML or text)"
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <button onClick={savePage} className="bg-purple-600 text-white px-4 py-2 rounded">
          {selectedId ? "Update Page" : "Save Page"}
        </button>
      </div>

      <div className="space-y-3">
        {pages.map(p => (
          <div key={p.id} className="bg-white p-3 rounded shadow flex justify-between">
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-gray-500">/{p.slug}</p>
            </div>
            <button onClick={() => editPage(p)} className="text-blue-600">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesManager;
