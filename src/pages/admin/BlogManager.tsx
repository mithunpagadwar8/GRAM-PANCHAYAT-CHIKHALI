import React, { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db, storage } from '../../services/firebaseconfig';

/**
 * =====================================================
 * BLOG MANAGER – CMS
 * Create / Publish / Delete blog posts
 * =====================================================
 */

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

const BlogManager: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "blogs"), snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  const addPost = async () => {
    if (!title || !content) return alert("Title & content required");

    await addDoc(collection(db, "blogs"), {
      title,
      content,
      createdAt: Date.now()
    });

    setTitle("");
    setContent("");
  };

  const deletePost = async (id: string) => {
    await deleteDoc(doc(db, "blogs", id));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">✍️ Blog Manager</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          className="border p-2 w-full mb-2"
          placeholder="Blog title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 w-full mb-2 h-40"
          placeholder="Blog content"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button onClick={addPost} className="bg-blue-600 text-white px-4 py-2 rounded">
          Publish Blog
        </button>
      </div>

      <div className="space-y-3">
        {posts.map(p => (
          <div key={p.id} className="bg-white p-3 rounded shadow">
            <p className="font-semibold">{p.title}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{p.content}</p>
            <button onClick={() => deletePost(p.id)} className="text-red-600 mt-2">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogManager;
