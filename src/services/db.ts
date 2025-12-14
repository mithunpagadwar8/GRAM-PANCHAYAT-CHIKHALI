// Mock DB Services
export const subscribeToCollection = (collection: string, onData: (data: any[]) => void, onError?: (error: any) => void) => {
  console.log(`Subscribed to ${collection}`);
  // Simulate data fetch or error if needed
  onData([]); 
  return () => console.log(`Unsubscribed from ${collection}`);
};

export const addToCollection = (collection: string, data: any) => {
  console.log(`Added to ${collection}`, data);
};

export const deleteFromCollection = (collection: string, id: string) => {
  console.log(`Deleted from ${collection}`, id);
};

export const updateInCollection = (collection: string, id: string, data: any) => {
  console.log(`Updated in ${collection} ${id}`, data);
};
