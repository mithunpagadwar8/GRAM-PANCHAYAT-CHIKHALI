import React, { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";

/**
 * =====================================================
 * SCHEMES MANAGER – Government Schemes CMS
 * Add / List / Delete schemes
 * =====================================================
 */

interface Scheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  createdAt: number;
}

const SchemesManager: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eligibility, setEligibility] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "schemes"), snap => {
      setSchemes(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  const addScheme = async () => {
    if (!title || !description) return alert("Title & description required");

    await addDoc(collection(db, "schemes"), {
      title,
      description,
      eligibility,
      createdAt: Date.now()
    });

    setTitle("");
    setDescription("");
    setEligibility("");
  };

  const deleteScheme = async (id: string) => {
    await deleteDoc(doc(db, "schemes", id));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🏛️ Schemes Manager</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          className="border p-2 w-full mb-2"
          placeholder="Scheme title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Scheme description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Eligibility (optional)"
          value={eligibility}
          onChange={e => setEligibility(e.target.value)}
        />
        <button onClick={addScheme} className="bg-indigo-600 text-white px-4 py-2 rounded">
          Add Scheme
        </button>
      </div>

      <div className="space-y-3">
        {schemes.map(s => (
          <div key={s.id} className="bg-white p-3 rounded shadow">
            <p className="font-semibold">{s.title}</p>
            <p className="text-sm text-gray-600">{s.description}</p>
            {s.eligibility && (
              <p className="text-xs text-gray-500 mt-1">Eligibility: {s.eligibility}</p>
            )}
            <button onClick={() => deleteScheme(s.id)} className="text-red-600 mt-2">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemesManager;
