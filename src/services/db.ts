import { db, storage } from '../firebaseConfig';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

export const subscribeToCollection = (
  collectionName: string,
  callback: (data: any[]) => void,
  onError?: (error: any) => void
) => {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(data);
      },
      (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionName}:`, error);
    if (onError) onError(error);
    return () => {};
  }
};

export const addToCollection = async (collectionName: string, data: any) => {
  try {
    const colRef = collection(db, collectionName);
    const { id, ...dataWithoutId } = data;
    if (id) {
      await setDoc(doc(db, collectionName, id), dataWithoutId);
      return id;
    } else {
      const docRef = await addDoc(colRef, dataWithoutId);
      return docRef.id;
    }
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    throw error;
  }
};

export const deleteFromCollection = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log(`Successfully deleted ${docId} from ${collectionName}`);
    return true;
  } catch (error) {
    console.error(`Error deleting from ${collectionName}:`, error);
    throw error;
  }
};

export const updateInCollection = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const { id, ...dataWithoutId } = data;
    await updateDoc(docRef, dataWithoutId);
    console.log(`Successfully updated ${docId} in ${collectionName}`);
    return true;
  } catch (error) {
    console.error(`Error updating in ${collectionName}:`, error);
    throw error;
  }
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (fileUrl: string): Promise<boolean> => {
  try {
    if (!fileUrl || !fileUrl.includes('firebase')) return true;
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};
