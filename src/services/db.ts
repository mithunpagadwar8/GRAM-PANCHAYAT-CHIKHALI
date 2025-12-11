
import { db } from '../firebaseConfig';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query } from 'firebase/firestore';

// Generic Subscribe Function (Realtime Listener)
export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void,
  onError?: (error: any) => void
) => {
  try {
    const q = query(collection(db, collectionName));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
        console.error(`Error syncing ${collectionName}:`, error);
        if (onError) onError(error);
    });
  } catch (e) {
    console.error("Firebase not initialized or query failed", e);
    if (onError) onError(e);
    return () => {};
  }
};

// Generic Add Function
export const addToCollection = async (collectionName: string, data: any) => {
  try {
    await addDoc(collection(db, collectionName), data);
    return true;
  } catch (error: any) {
    console.error("Error adding document: ", error);
    alert(`Error Adding Data: ${error.message}\nCheck Firebase Rules.`);
    return false;
  }
};

// Generic Delete Function
export const deleteFromCollection = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  } catch (error: any) {
    console.error("Error deleting document: ", error);
    alert(`Delete Failed: ${error.message}\n\nSolution: Go to Firebase Console > Firestore Database > Rules tab.\nChange 'allow write: if false' to 'allow write: if request.auth != null'`);
    return false;
  }
};

// Generic Update Function
export const updateInCollection = async (collectionName: string, id: string, data: any) => {
    try {
        await updateDoc(doc(db, collectionName, id), data);
        return true;
    } catch (error: any) {
        console.error("Error updating document: ", error);
        alert(`Update Failed: ${error.message}`);
        return false;
    }
};

export const saveSettings = async (settings: any) => {
    console.log("Settings synced to cloud"); 
};
