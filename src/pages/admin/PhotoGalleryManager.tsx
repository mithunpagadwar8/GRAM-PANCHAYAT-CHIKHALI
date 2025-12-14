import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import { db, storage, isConfigured } from '../../services/firebaseconfig';

/**
 * =====================================================
 * PHOTO GALLERY MANAGER – Upload and Manage Images
 * Firebase Storage + Firestore Sync
 * =====================================================
 */

interface PhotoGalleryItem {
  id: string;
  imageUrl: string;
}

const PhotoGalleryManager: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoGalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ================= LOAD PHOTOS =================
  useEffect(() => {
    if (!isConfigured()) return;

    const unsub = onSnapshot(collection(db, 'photoGallery'), (snap) => {
      const data: PhotoGalleryItem[] = snap.docs.map((d) => ({
        id: d.id,
        imageUrl: d.data().imageUrl,
      }));
      setPhotos(data);
    });

    return () => unsub();
  }, []);

  // ================= UPLOAD PHOTO =================
  const uploadPhoto = (file: File) => {
    if (!file || !isConfigured()) return;

    setUploading(true);
    const storageRef = ref(storage, `photo-gallery/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      (snap) => {
        const percent = (snap.bytesTransferred / snap.totalBytes) * 100;
        setProgress(Math.round(percent));
      },
      (err) => {
        console.error(err);
        alert('Upload failed');
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await addDoc(collection(db, 'photoGallery'), {
          imageUrl: url,
        });
        setUploading(false);
        setProgress(0);
      }
    );
  };

  // ================= DELETE PHOTO =================
  const deletePhoto = async (photo: PhotoGalleryItem) => {
    if (!window.confirm('Delete this photo?')) return;

    try {
      await deleteDoc(doc(db, 'photoGallery', photo.id));
      const fileRef = ref(storage, photo.imageUrl);
      await deleteObject(fileRef).catch(() => {});
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Photo Gallery Manager</h1>

      {/* UPLOAD PHOTO */}
      <div className="bg-white p-4 rounded shadow">
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => e.target.files && uploadPhoto(e.target.files[0])}
        />

        {uploading && (
          <div className="mt-2 text-sm">
            Uploading: {progress}%
            <div className="w-full bg-gray-200 h-2 rounded mt-1">
              <div
                className="bg-green-600 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* PREVIEW GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.imageUrl}
              className="h-40 w-full object-cover rounded"
            />
            <button
              onClick={() => deletePhoto(photo)}
              className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Firestore: <b>photoGallery</b> | Storage: <b>photo-gallery/</b>
      </p>
    </div>
  );
};

export default PhotoGalleryManager;
