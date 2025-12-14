import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from '../../services/firebaseconfig';

interface GalleryImage {
  id: string;
  imageUrl: string;
  storagePath: string;
  category: string;
}

const PhotoGalleryManager: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("General");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [error, setError] = useState("");

  // Fetch existing images
  useEffect(() => {
    const fetchImages = async () => {
      const q = query(collection(db, "photoGallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data: GalleryImage[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<GalleryImage, "id">),
      }));
      setImages(data);
    };

    fetchImages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
    setProgress(Array(e.target.files.length).fill(0));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select images");
      return;
    }

    setUploading(true);
    setError("");

    files.forEach((file, index) => {
      const storagePath = `photo-gallery/${category}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress((prev) => {
            const copy = [...prev];
            copy[index] = percent;
            return copy;
          });
        },
        (err) => {
          console.error(err);
          setError("Upload failed");
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const docRef = await addDoc(collection(db, "photoGallery"), {
            imageUrl: downloadURL,
            storagePath,
            category,
            createdAt: serverTimestamp(),
          });

          setImages((prev) => [
            {
              id: docRef.id,
              imageUrl: downloadURL,
              storagePath,
              category,
            },
            ...prev,
          ]);

          if (index === files.length - 1) {
            setFiles([]);
            setProgress([]);
            setUploading(false);
          }
        }
      );
    });
  };

  const handleDelete = async (img: GalleryImage) => {
    if (!confirm("Delete this image permanently?")) return;

    await deleteDoc(doc(db, "photoGallery", img.id));
    await deleteObject(ref(storage, img.storagePath));

    setImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Upload Photos</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mb-3 p-2 border rounded"
        >
          <option>General</option>
          <option>Events</option>
          <option>Meetings</option>
          <option>Development</option>
        </select>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="mb-3 block"
        />

        {progress.map((p, i) => (
          <div key={i} className="mb-2">
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-600 rounded"
                style={{ width: `${p}%` }}
              />
            </div>
            <p className="text-sm">Image {i + 1}: {p}%</p>
          </div>
        ))}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Gallery Images</h2>

        {images.length === 0 && (
          <p className="text-gray-500">No images uploaded yet.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.imageUrl}
                className="w-full h-40 object-cover rounded"
              />
              <button
                onClick={() => handleDelete(img)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoGalleryManager;
