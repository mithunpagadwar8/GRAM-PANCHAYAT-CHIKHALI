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
 * HERO SLIDER MANAGER
 * Firestore + Firebase Storage
 * =====================================================
 */

interface SliderItem {
  id: string;
  imageUrl: string;
}

const HeroSliderManager: React.FC = () => {
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [uploading, setUploading] = useState(false);

  // ================= LOAD SLIDES =================
  useEffect(() => {
    if (!isConfigured()) return;

    const unsub = onSnapshot(
      collection(db, "heroSlider"),
      (snapshot) => {
        const data: SliderItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          imageUrl: d.data().imageUrl,
        }));
        setSlides(data);
      }
    );

    return () => unsub();
  }, []);

  // ================= UPLOAD IMAGE =================
  const handleUpload = async (file: File) => {
    if (!file || !isConfigured()) return;

    try {
      setUploading(true);

      const storageRef = ref(
        storage,
        `hero-slider/${Date.now()}-${file.name}`
      );

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "heroSlider"), {
        imageUrl: url,
        createdAt: serverTimestamp(),
      });

      alert("✅ Image added to Hero Slider");
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ================= DELETE IMAGE =================
  const handleDelete = async (slide: SliderItem) => {
    if (!isConfigured()) return;

    if (!confirm("Delete this slide?")) return;

    try {
      const fileRef = ref(storage, slide.imageUrl);
      await deleteObject(fileRef);
      await deleteDoc(doc(db, "heroSlider", slide.id));
    } catch (err) {
      console.error(err);
      alert("❌ Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hero Slider Manager</h1>

      {/* Upload */}
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
      />

      {/* Slides */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-white rounded shadow p-2 relative"
          >
            <img
              src={slide.imageUrl}
              alt="slide"
              className="w-full h-40 object-cover rounded"
            />
            <button
              onClick={() => handleDelete(slide)}
              className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <p className="text-gray-500 text-sm">No slider images added yet.</p>
      )}
    </div>
  );
};

export default HeroSliderManager;
