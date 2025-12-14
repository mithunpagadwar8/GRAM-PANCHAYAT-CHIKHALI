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
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, isConfigured } from "../../services/firebaseconfig";

/**
 * =====================================================
 * HERO SLIDER MANAGER – YouTube Style
 * Upload | Preview | Progress | Delete
 * Firebase Firestore + Storage (CDN)
 * =====================================================
 */

interface SliderItem {
  id: string;
  imageUrl: string;
}

const HeroSliderManager: React.FC = () => {
  const [items, setItems] = useState<SliderItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ================= LOAD SLIDES =================
  useEffect(() => {
    if (!isConfigured()) return;

    const unsub = onSnapshot(collection(db, "heroSlider"), (snap) => {
      const data: SliderItem[] = snap.docs.map((d) => ({
        id: d.id,
        imageUrl: d.data().imageUrl,
      }));
      setItems(data);
    });

    return () => unsub();
  }, []);

  // ================= UPLOAD =================
  const uploadImage = (file: File) => {
    if (!file || !isConfigured()) return;

    setUploading(true);
    const storageRef = ref(storage, `hero-slider/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => {
        const percent = (snap.bytesTransferred / snap.totalBytes) * 100;
        setProgress(Math.round(percent));
      },
      (err) => {
        console.error(err);
        alert("Upload failed");
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await addDoc(collection(db, "heroSlider"), {
          imageUrl: url,
          createdAt: serverTimestamp(),
        });
        setUploading(false);
        setProgress(0);
      }
    );
  };

  // ================= DELETE =================
  const deleteSlide = async (item: SliderItem) => {
    if (!window.confirm("Delete this slide?")) return;

    try {
      await deleteDoc(doc(db, "heroSlider", item.id));
      const fileRef = ref(storage, item.imageUrl);
      await deleteObject(fileRef).catch(() => {});
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hero Slider Manager</h1>

      {/* UPLOAD */}
      <div className="bg-white p-4 rounded shadow">
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => e.target.files && uploadImage(e.target.files[0])}
        />

        {uploading && (
          <div className="mt-2 text-sm">
            Uploading: {progress}%
            <div className="w-full bg-gray-200 h-2 rounded mt-1">
              <div
                className="bg-red-600 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* PREVIEW GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <img
              src={item.imageUrl}
              className="h-40 w-full object-cover rounded"
            />
            <button
              onClick={() => deleteSlide(item)}
              className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Firestore: <b>heroSlider</b> | Storage: <b>hero-slider/</b>
      </p>
    </div>
  );
};

export default HeroSliderManager;
