import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { db, storage, isConfigured } from "../../services/firebaseconfig";

/**
 * =====================================================
 * SCHEMES MANAGER – Admin CMS
 * Upload PDF / Image | CRUD
 * =====================================================
 */

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  deadline?: string;
  docUrl?: string;
}

const SchemesManager: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [deadline, setDeadline] = useState("");
  const [uploading, setUploading] = useState(false);

  // ================= LOAD SCHEMES =================
  useEffect(() => {
    if (!isConfigured()) return;

    const unsub = onSnapshot(collection(db, "schemes"), (snapshot) => {
      const data: Scheme[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Scheme, "id">),
      }));
      setSchemes(data);
    });

    return () => unsub();
  }, []);

  // ================= FILE UPLOAD =================
  const uploadFile = async (file: File) => {
    const fileRef = ref(storage, `schemes/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  // ================= ADD SCHEME =================
  const addScheme = async (file?: File) => {
    if (!name || !description) {
      alert("Scheme name & description required");
      return;
    }

    try {
      setUploading(true);

      let docUrl = "";
      if (file) {
        docUrl = await uploadFile(file);
      }

      await addDoc(collection(db, "schemes"), {
        name,
        description,
        eligibility,
        deadline,
        docUrl,
        createdAt: serverTimestamp(),
      });

      setName("");
      setDescription("");
      setEligibility("");
      setDeadline("");
      alert("✅ Scheme added");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add scheme");
    } finally {
      setUploading(false);
    }
  };

  // ================= DELETE SCHEME =================
  const deleteScheme = async (scheme: Scheme) => {
    if (!confirm("Delete this scheme?")) return;

    try {
      if (scheme.docUrl) {
        const fileRef = ref(storage, scheme.docUrl);
        await deleteObject(fileRef);
      }
      await deleteDoc(doc(db, "schemes", scheme.id));
    } catch (err) {
      console.error(err);
      alert("❌ Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Schemes Manager</h1>

      {/* ADD FORM */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Scheme Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Eligibility"
          value={eligibility}
          onChange={(e) => setEligibility(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <input type="file" accept=".pdf,image/*" />

        <button
          disabled={uploading}
          onClick={(e) => {
            const fileInput =
              (e.currentTarget.previousSibling as HTMLInputElement) || null;
            addScheme(fileInput?.files?.[0]);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Scheme
        </button>
      </div>

      {/* LIST */}
      <div className="grid md:grid-cols-2 gap-4">
        {schemes.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{s.name}</h3>
            <p className="text-sm text-gray-600">{s.description}</p>

            {s.eligibility && (
              <p className="text-xs mt-1">
                <b>Eligibility:</b> {s.eligibility}
              </p>
            )}

            {s.deadline && (
              <p className="text-xs text-red-600">
                Deadline: {s.deadline}
              </p>
            )}

            {s.docUrl && (
              <a
                href={s.docUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-sm block mt-2"
              >
                View Document
              </a>
            )}

            <button
              onClick={() => deleteScheme(s)}
              className="mt-3 text-xs bg-red-600 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemesManager;
