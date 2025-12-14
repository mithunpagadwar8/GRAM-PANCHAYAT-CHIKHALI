import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "./firebase";

// HERO SLIDER
export const getHeroSlides = async () => {
  const q = query(collection(db, "heroSlides"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// NOTICES (Pinned first)
export const getNotices = async () => {
  const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// PHOTOS
export const getPhotos = async () => {
  const snap = await getDocs(collection(db, "photos"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// VIDEOS
export const getVideos = async () => {
  const snap = await getDocs(collection(db, "videos"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// BLOGS
export const getBlogs = async () => {
  const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// SCHEMES
export const getSchemes = async () => {
  const snap = await getDocs(collection(db, "schemes"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
