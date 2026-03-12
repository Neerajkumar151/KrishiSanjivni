/**
 * IndexedDB utility for KrishiSanjivni PWA
 * Provides offline-first data storage for farmer data.
 */

const DB_NAME = 'KrishiSanjivniDB';
const DB_VERSION = 1;

export type StoreName =
  | 'advisories'
  | 'cropRecommendations'
  | 'farmingGuides'
  | 'userQueries'
  | 'pendingRequests';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      // AI advisory responses
      if (!db.objectStoreNames.contains('advisories')) {
        db.createObjectStore('advisories', { keyPath: 'id', autoIncrement: true });
      }

      // Crop recommendation results
      if (!db.objectStoreNames.contains('cropRecommendations')) {
        db.createObjectStore('cropRecommendations', { keyPath: 'id', autoIncrement: true });
      }

      // Educational farming guides
      if (!db.objectStoreNames.contains('farmingGuides')) {
        db.createObjectStore('farmingGuides', { keyPath: 'id', autoIncrement: true });
      }

      // Recent user queries
      if (!db.objectStoreNames.contains('userQueries')) {
        db.createObjectStore('userQueries', { keyPath: 'id', autoIncrement: true });
      }

      // Pending requests for background sync
      if (!db.objectStoreNames.contains('pendingRequests')) {
        db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a record to a given object store.
 */
export async function saveToStore<T extends Record<string, unknown>>(
  storeName: StoreName,
  data: T
): Promise<IDBValidKey> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    const record = { ...data, timestamp: Date.now() };
    const request = store.add(record);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Get all records from a given object store.
 */
export async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Get a single record by its key.
 */
export async function getByKey<T>(
  storeName: StoreName,
  key: IDBValidKey
): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Delete a record by key.
 */
export async function deleteFromStore(
  storeName: StoreName,
  key: IDBValidKey
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Clear all records from a store.
 */
export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
