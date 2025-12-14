import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../services/firebase";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  storagePath: string;
}

const HeroSliderManager: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  // Fetch existing slides
  useEffect(() => {
    const fetchSlides = async () => {
      const q = query(collection(db, "heroSlides"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data: HeroSlide[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<HeroSlide, "id">),
      }));
      setSlides(data);
    };

    fetchSlides();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image");
      return;
    }

    setUploading(true);
    setError("");

    const storagePath = `hero-slides/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(percent);
      },
      (err) => {
        console.error(err);
        setError("Upload failed");
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        const docRef = await addDoc(collection(db, "heroSlides"), {
          title,
          subtitle,
          imageUrl: downloadURL,
          storagePath,
          createdAt: serverTimestamp(),
        });

        setSlides((prev) => [
          {
            id: docRef.id,
            title,
            subtitle,
            imageUrl: downloadURL,
            storagePath,
          },
          ...prev,
        ]);

        setTitle("");
        setSubtitle("");
        setFile(null);
        setProgress(0);
        setUploading(false);
      }
    );
  };

  const handleDelete = async (slide: HeroSlide) => {
    if (!confirm("Delete this slide permanently?")) return;

    await deleteDoc(doc(db, "heroSlides", slide.id));
    await deleteObject(ref(storage, slide.storagePath));

    setSlides((prev) => prev.filter((s) => s.id !== slide.id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Add New Hero Slide</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-3"
        />

        {uploading && (
          <div className="mb-3">
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-600 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm mt-1">{progress}%</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {uploading ? "Uploading..." : "Upload Slide"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Existing Slides</h2>

        {slides.length === 0 && (
          <p className="text-gray-500">No hero slides uploaded yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <div key={slide.id} className="border rounded-lg overflow-hidden">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold">{slide.title}</h3>
                <p className="text-sm text-gray-600">{slide.subtitle}</p>
                <button
                  onClick={() => handleDelete(slide)}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSliderManager;
