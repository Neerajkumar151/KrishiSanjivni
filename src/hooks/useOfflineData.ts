import { useState, useEffect, useCallback } from 'react';
import {
  saveToStore,
  getAllFromStore,
  getByKey,
  deleteFromStore,
  clearStore,
  type StoreName,
} from '@/lib/indexedDB';

/**
 * React hook for offline-first data access using IndexedDB.
 *
 * Usage:
 *   const { isOnline, saveData, getData, getAllData, removeData, clearData } = useOfflineData();
 */
export function useOfflineData() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /** Save data to an IndexedDB store. */
  const saveData = useCallback(
    async <T extends Record<string, unknown>>(
      storeName: StoreName,
      data: T
    ): Promise<IDBValidKey | null> => {
      try {
        return await saveToStore(storeName, data);
      } catch (err) {
        console.error(`[useOfflineData] Failed to save to "${storeName}":`, err);
        return null;
      }
    },
    []
  );

  /** Get a single record by key. */
  const getData = useCallback(
    async <T>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> => {
      try {
        return await getByKey<T>(storeName, key);
      } catch (err) {
        console.error(`[useOfflineData] Failed to read from "${storeName}":`, err);
        return undefined;
      }
    },
    []
  );

  /** Get all records from a store. */
  const getAllData = useCallback(
    async <T>(storeName: StoreName): Promise<T[]> => {
      try {
        return await getAllFromStore<T>(storeName);
      } catch (err) {
        console.error(`[useOfflineData] Failed to read all from "${storeName}":`, err);
        return [];
      }
    },
    []
  );

  /** Delete a single record. */
  const removeData = useCallback(
    async (storeName: StoreName, key: IDBValidKey): Promise<void> => {
      try {
        await deleteFromStore(storeName, key);
      } catch (err) {
        console.error(`[useOfflineData] Failed to delete from "${storeName}":`, err);
      }
    },
    []
  );

  /** Clear all records in a store. */
  const clearData = useCallback(
    async (storeName: StoreName): Promise<void> => {
      try {
        await clearStore(storeName);
      } catch (err) {
        console.error(`[useOfflineData] Failed to clear "${storeName}":`, err);
      }
    },
    []
  );

  return {
    isOnline,
    saveData,
    getData,
    getAllData,
    removeData,
    clearData,
  };
}
