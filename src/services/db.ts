
import { db } from '../firebaseConfig';
import { collection, addDoc, deleteDoc, doc, updateDoc, setDoc, onSnapshot, query } from 'firebase/firestore';

// Subscribe to a Collection (List)
export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void,
  onError?: (error: any) => void
) => {
  try {
    const q = query(collection(db, collectionName));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(), // First spread data
        id: doc.id     // THEN overwrite id with Firestore Document ID (CRITICAL FIX)
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

// Subscribe to a Single Document (e.g., Settings)
export const subscribeToDocument = (
    collectionName: string,
    docId: string,
    callback: (data: any) => void,
    onError?: (error: any) => void
) => {
    try {
        return onSnapshot(doc(db, collectionName, docId), (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            } else {
                callback(null);
            }
        }, (error) => {
            console.error(`Error syncing document ${collectionName}/${docId}:`, error);
            if(onError) onError(error);
        });
    } catch (e) {
        if(onError) onError(e);
        return () => {};
    }
}

export const addToCollection = async (collectionName: string, data: any) => {
  try {
    // Remove 'id' from data if it exists to avoid confusion, Firestore generates its own
    const { id, ...cleanData } = data; 
    await addDoc(collection(db, collectionName), cleanData);
    return true;
  } catch (error: any) {
    console.error("Error adding document: ", error);
    alert(`Upload Error: ${error.message}\nCheck Firebase Rules.`);
    return false;
  }
};

export const deleteFromCollection = async (collectionName: string, id: string) => {
  try {
    if (!id) {
        alert("Error: Invalid ID. Cannot delete.");
        return false;
    }
    await deleteDoc(doc(db, collectionName, id));
    return true;
  } catch (error: any) {
    console.error("Error deleting document: ", error);
    alert(`Delete Failed: ${error.message}\n\n1. Check Internet.\n2. Go to Firebase Console > Firestore Database > Rules.\n3. Ensure it says: allow write: if request.auth != null;`);
    return false;
  }
};

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

// Save Settings (Upsert)
export const saveSettings = async (settings: any) => {
    try {
        await setDoc(doc(db, 'settings', 'global'), settings);
        console.log("Settings synced to cloud");
        return true;
    } catch (error: any) {
        console.error("Settings Sync Failed", error);
        alert(`Settings Save Failed: ${error.message}`);
        return false;
    }
};
