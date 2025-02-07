import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface SyncItem {
  id: string;
  endpoint: string;
  method: string;
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);

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

  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      syncData();
    }
  }, [isOnline, syncQueue]);

  const addToSyncQueue = (endpoint: string, method: string, data: any) => {
    const syncItem: SyncItem = {
      id: crypto.randomUUID(),
      endpoint,
      method,
      data,
      timestamp: Date.now(),
    };

    setSyncQueue(prev => [...prev, syncItem]);
    localStorage.setItem('syncQueue', JSON.stringify([...syncQueue, syncItem]));
    
    return syncItem.id;
  };

  const syncData = async () => {
    const queue = [...syncQueue];
    for (const item of queue) {
      try {
        await apiRequest(item.method, item.endpoint, item.data);
        setSyncQueue(prev => prev.filter(i => i.id !== item.id));
      } catch (error) {
        console.error('Sync failed for item:', item, error);
      }
    }
    localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
  };

  return {
    isOnline,
    addToSyncQueue,
    syncQueue
  };
}
