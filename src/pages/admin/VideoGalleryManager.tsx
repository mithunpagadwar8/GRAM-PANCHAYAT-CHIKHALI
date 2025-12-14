import React, { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from '../../services/firebaseconfig';

/**
 * =====================================================
 * VIDEO GALLERY MANAGER (YouTube-style)
 * Firebase Storage + CDN
 * Upload / Progress / Preview / Delete
 * =====================================================
 */

interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumb: string;
  createdAt: number;
}

const VideoGalleryManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "videos"), snap => {
      setVideos(
        snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
      );
    });
    return () => unsub();
  }, []);

  const handleUpload = () => {
    if (!file || !title) return alert("Title & video required");

    const storageRef = ref(storage, `videos/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    setUploading(true);

    task.on("state_changed", snap => {
      setProgress((snap.bytesTransferred / snap.totalBytes) * 100);
    }, console.error, async () => {
      const url = await getDownloadURL(task.snapshot.ref);

      await addDoc(collection(db, "videos"), {
        title,
        url,
        thumb: "",
        createdAt: Date.now()
      });

      setFile(null);
      setTitle("");
      setProgress(0);
      setUploading(false);
    });
  };

  const handleDelete = async (v: VideoItem) => {
    await deleteDoc(doc(db, "videos", v.id));
    await deleteObject(ref(storage, v.url));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🎬 Video Manager</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          className="border p-2 w-full mb-2"
          placeholder="Video title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        {uploading && <progress value={progress} max={100} className="w-full mt-2" />}
        <button onClick={handleUpload} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">
          Upload Video
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {videos.map(v => (
          <div key={v.id} className="bg-white p-3 rounded shadow">
            <video src={v.url} controls className="w-full rounded" />
            <p className="mt-2 font-medium">{v.title}</p>
            <button onClick={() => handleDelete(v)} className="mt-2 text-red-600">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGalleryManager;
