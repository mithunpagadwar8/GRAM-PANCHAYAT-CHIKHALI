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
 * BLOG / NOTICE MANAGER
 * Image | Video | YouTube
 * =====================================================
 */

type MediaType = "image" | "video" | "youtube";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  mediaType: MediaType;
  mediaUrl?: string;
  publishDate: string;
}

const BlogManager: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Notice");
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // ================= LOAD POSTS =================
  useEffect(() => {
    if (!isConfigured()) return;

    const unsub = onSnapshot(collection(db, "blogs"), (snapshot) => {
      const data: BlogPost[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<BlogPost, "id">),
      }));
      setPosts(data);
    });

    return () => unsub();
  }, []);

  // ================= FILE UPLOAD =================
  const uploadFile = async (file: File) => {
    const storageRef = ref(storage, `blogs/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // ================= ADD POST =================
  const addPost = async (file?: File) => {
    if (!title || !content) {
      alert("Title & content required");
      return;
    }

    try {
      setUploading(true);
      let finalMediaUrl = mediaUrl;

      if ((mediaType === "image" || mediaType === "video") && file) {
        finalMediaUrl = await uploadFile(file);
      }

      await addDoc(collection(db, "blogs"), {
        title,
        content,
        category,
        mediaType,
        mediaUrl: finalMediaUrl || "",
        publishDate: new Date().toISOString().split("T")[0],
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setContent("");
      setMediaUrl("");
      alert("✅ Post published");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to publish");
    } finally {
      setUploading(false);
    }
  };

  // ================= DELETE POST =================
  const deletePost = async (post: BlogPost) => {
    if (!confirm("Delete this post?")) return;

    try {
      if (
        (post.mediaType === "image" || post.mediaType === "video") &&
        post.mediaUrl
      ) {
        const fileRef = ref(storage, post.mediaUrl);
        await deleteObject(fileRef);
      }

      await deleteDoc(doc(db, "blogs", post.id));
    } catch (err) {
      console.error(err);
      alert("❌ Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Blog / Notice Manager</h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option>Notice</option>
            <option>News</option>
            <option>Blog</option>
          </select>

          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType)}
            className="border p-2 rounded"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>

        {mediaType === "youtube" && (
          <input
            className="w-full border p-2 rounded"
            placeholder="YouTube URL"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        )}

        {(mediaType === "image" || mediaType === "video") && (
          <input type="file" accept="image/*,video/*" />
        )}

        <button
          disabled={uploading}
          onClick={(e) => {
            const fileInput =
              (e.currentTarget.previousSibling as HTMLInputElement) || null;
            addPost(fileInput?.files?.[0]);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Publish
        </button>
      </div>

      {/* POSTS LIST */}
      <div className="grid md:grid-cols-2 gap-4">
        {posts.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded shadow">
            <h3 className="font-bold">{p.title}</h3>
            <p className="text-sm text-gray-600">{p.category}</p>

            {p.mediaType === "image" && p.mediaUrl && (
              <img src={p.mediaUrl} className="mt-2 rounded" />
            )}

            {p.mediaType === "video" && p.mediaUrl && (
              <video controls className="mt-2 w-full rounded">
                <source src={p.mediaUrl} />
              </video>
            )}

            {p.mediaType === "youtube" && p.mediaUrl && (
              <iframe
                src={p.mediaUrl.replace("watch?v=", "embed/")}
                className="w-full h-48 mt-2 rounded"
              />
            )}

            <button
              onClick={() => deletePost(p)}
              className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogManager;
