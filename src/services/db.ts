import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  getDoc
} from "firebase/firestore";
import { db } from "../firebaseConfig";

/* ------------------------------
   ADD
-------------------------------- */
export const addToCollection = async (
  collectionName: string,
  data: any
) => {
  return await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Date.now(),
  });
};

/* ------------------------------
   DELETE
-------------------------------- */
export const deleteFromCollection = async (
  collectionName: string,
  docId: string
) => {
  return await deleteDoc(doc(db, collectionName, docId));
};

/* ------------------------------
   UPDATE
-------------------------------- */
export const updateInCollection = async (
  collectionName: string,
  docId: string,
  data: any
) => {
  return await updateDoc(doc(db, collectionName, docId), data);
};

/* ------------------------------
   SUBSCRIBE COLLECTION
-------------------------------- */
export const subscribeToCollection = (
  collectionName: string,
  callback: (data: any[]) => void
) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const list = snapshot.docs.map((d) => ({
      docId: d.id,
      ...d.data(),
    }));
    callback(list);
  });
};

/* ------------------------------
   ✅ MISSING FUNCTION (FIX)
-------------------------------- */
export const subscribeToDocument = async (
  collectionName: string,
  docId: string
) => {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

/* ------------------------------
   SAVE SETTINGS
-------------------------------- */
export const saveSettings = async (settings: any) => {
  return updateDoc(doc(db, "settings", "global"), settings);
};
