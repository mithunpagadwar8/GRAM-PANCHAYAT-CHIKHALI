import React, { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

/**
 * =====================================================
 * NOTICE / NEWS MANAGER
 * Admin can add, pin, unpin, delete notices
 * Homepage ticker ready
 * =====================================================
 */

interface Notice {
  id: string;
  title: string;
  description: string;
  pinned: boolean;
  createdAt: number;
}

const NoticeManager: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "notices"), snap => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  const addNotice = async () => {
    if (!title) return alert("Title required");

    await addDoc(collection(db, "notices"), {
      title,
      description,
      pinned: false,
      createdAt: Date.now()
    });

    setTitle("");
    setDescription("");
  };

  const togglePin = async (n: Notice) => {
    await updateDoc(doc(db, "notices", n.id), { pinned: !n.pinned });
  };

  const deleteNotice = async (id: string) => {
    await deleteDoc(doc(db, "notices", id));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📢 Notice / News Manager</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          className="border p-2 w-full mb-2"
          placeholder="Notice title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button onClick={addNotice} className="bg-green-600 text-white px-4 py-2 rounded">
          Add Notice
        </button>
      </div>

      <div className="space-y-3">
        {notices.map(n => (
          <div key={n.id} className="bg-white p-3 rounded shadow flex justify-between">
            <div>
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm text-gray-600">{n.description}</p>
              {n.pinned && <span className="text-xs text-blue-600">Pinned</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => togglePin(n)} className="text-blue-600">
                {n.pinned ? "Unpin" : "Pin"}
              </button>
              <button onClick={() => deleteNotice(n.id)} className="text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeManager;
