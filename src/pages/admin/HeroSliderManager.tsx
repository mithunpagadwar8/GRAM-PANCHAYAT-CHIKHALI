import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../services/firebase";

/**
 * =====================================================
 * HERO SLIDER MANAGER (ADMIN)
 * YouTube-style | Firebase + CDN | Fast Upload
 * Upload / Preview / Delete
 * =====================================================
 */

interface SliderItem {
  id: string;
  imageUrl: string;
  createdAt?: any;
}

const HeroSliderManager: React.FC = () => {
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ================= LOAD SLIDES =================
  useEffect(() => {
    const q = query(
      collection(db, "heroSlider"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: SliderItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setSlides(data);
    });

    return () => unsub();
  }, []);

  // ================= UPLOAD =================
  const handleUpload = (file: File) => {
    setUploading(true);
    setProgress(0);

    const fileRef = ref(
      storage,
      `hero-slider/${Date.now()}-${file.name}`
    );

    const task = uploadBytesResumable(fileRef, file);

    task.on(
      "state_changed",
      (snap) => {
        const percent = Math.round(
          (snap.bytesTransferred / snap.totalBytes) * 100
        );
        setProgress(percent);
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
  const handleDelete = async (slide: SliderItem) => {
    if (!window.confirm("Delete this slide?")) return;

    try {
      const imgRef = ref(storage, slide.imageUrl);
      await deleteObject(imgRef);
      await deleteDoc(doc(db, "heroSlider", slide.id));
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Hero Slider Manager</h2>

      {/* Upload */}
      <div className="bg-white p-4 rounded shadow">
        <label className="block font-semibold mb-2">Upload New Slide</label>
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) =>
            e.target.files && handleUpload(e.target.files[0])
          }
        />
        {uploading && (
          <div className="mt-2 text-sm">Uploading: {progress}%</div>
        )}
      </div>

      {/* Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slides.map((s) => (
          <div
            key={s.id}
            className="relative group border rounded overflow-hidden"
          >
            <img
              src={s.imageUrl}
              className="w-full h-40 object-cover"
            />
            <button
              onClick={() => handleDelete(s)}
              className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <p className="text-gray-500">No slides uploaded yet.</p>
      )}
    </div>
  );
};

export default HeroSliderManager;
