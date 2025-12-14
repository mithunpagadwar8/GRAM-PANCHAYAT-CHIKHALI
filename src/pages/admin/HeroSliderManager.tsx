import React, { useEffect, useState } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { storage, db } from "../../services/firebase";

interface SliderImage {
  id: string;
  url: string;
}

export default function HeroSliderManager() {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [uploading, setUploading] = useState(false);

  // 🔄 Load slider images realtime
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "heroSlider"), (snap) => {
      const data: SliderImage[] = snap.docs.map((d) => ({
        id: d.id,
        url: d.data().url,
      }));
      setImages(data);
    });
    return () => unsub();
  }, []);

  // ⬆️ Upload Image
  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);

    try {
      const storageRef = ref(
        storage,
        `hero-slider/${Date.now()}-${file.name}`
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "heroSlider"), {
        url,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // 🗑️ Delete Image
  const handleDelete = async (img: SliderImage) => {
    if (!confirm("Delete this slide?")) return;

    try {
      const fileRef = ref(storage, img.url);
      await deleteObject(fileRef);
      await deleteDoc(doc(db, "heroSlider", img.id));
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Hero Slider Manager</h2>

      {/* Upload */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files && handleUpload(e.target.files[0])
          }
        />
        {uploading && (
          <p className="text-sm text-blue-600 mt-2">Uploading...</p>
        )}
      </div>

      {/* Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="bg-white rounded shadow overflow-hidden"
          >
            <img
              src={img.url}
              alt="Slide"
              className="w-full h-40 object-cover"
            />
            <div className="p-2 text-center">
              <button
                onClick={() => handleDelete(img)}
                className="bg-red-600 text-white px-3 py-1 text-sm rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <p className="text-gray-500 mt-4">
          No slider images uploaded yet.
        </p>
      )}
    </div>
  );
}
