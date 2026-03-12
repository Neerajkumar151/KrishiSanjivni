/**
 * Background Sync utility for KrishiSanjivni PWA.
 *
 * Queues failed/offline requests into IndexedDB and replays them
 * when the network connection is restored.
 */

import { saveToStore, getAllFromStore, deleteFromStore } from './indexedDB';

export interface PendingRequest {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
}

/**
 * Queue a request for later replay.
 * Call this when a fetch/POST fails due to network issues.
 */
export async function queueRequest(
  url: string,
  options: RequestInit = {}
): Promise<void> {
  const pending: Omit<PendingRequest, 'id'> = {
    url,
    method: options.method || 'POST',
    headers: Object.fromEntries(
      options.headers instanceof Headers
        ? options.headers.entries()
        : Object.entries((options.headers as Record<string, string>) || {})
    ),
    body: typeof options.body === 'string' ? options.body : null,
    timestamp: Date.now(),
  };

  await saveToStore('pendingRequests', pending as unknown as Record<string, unknown>);
  console.log('[BackgroundSync] Request queued for later sync:', url);

  // Try to register for Background Sync if supported
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('krishi-background-sync');
      console.log('[BackgroundSync] Sync registered with service worker');
    } catch (err) {
      console.warn('[BackgroundSync] SW sync registration failed, will use manual replay:', err);
    }
  }
}

/**
 * Replay all pending requests.
 * Called when the app comes back online.
 */
export async function replayRequests(): Promise<{
  succeeded: number;
  failed: number;
}> {
  const pending = await getAllFromStore<PendingRequest>('pendingRequests');

  if (pending.length === 0) {
    return { succeeded: 0, failed: 0 };
  }

  console.log(`[BackgroundSync] Replaying ${pending.length} queued request(s)...`);

  let succeeded = 0;
  let failed = 0;

  for (const req of pending) {
    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });

      if (response.ok) {
        await deleteFromStore('pendingRequests', req.id!);
        succeeded++;
        console.log(`[BackgroundSync] ✅ Replayed: ${req.method} ${req.url}`);
      } else {
        failed++;
        console.warn(`[BackgroundSync] ⚠️ Server error for: ${req.url} (${response.status})`);
      }
    } catch (err) {
      failed++;
      console.error(`[BackgroundSync] ❌ Failed to replay: ${req.url}`, err);
    }
  }

  console.log(`[BackgroundSync] Replay complete: ${succeeded} succeeded, ${failed} failed`);
  return { succeeded, failed };
}

/**
 * Initialize the background sync listener.
 * Automatically replays pending requests when the browser comes online.
 */
export function initBackgroundSync(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', async () => {
    console.log('[BackgroundSync] Connection restored, starting replay...');
    const results = await replayRequests();

    if (results.succeeded > 0) {
      // Dispatch a custom event so the app can show a toast notification
      window.dispatchEvent(
        new CustomEvent('krishi-sync-complete', { detail: results })
      );
    }
  });

  console.log('[BackgroundSync] Initialized — listening for connectivity changes');
}
