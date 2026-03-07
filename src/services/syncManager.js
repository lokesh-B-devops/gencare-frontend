import { offlineDB } from '../utils/db';

/**
 * Sync Manager to handle pushing offline logs to the server.
 */
export const syncManager = {
    syncPendingLogs: async () => {
        const pendingLogs = await offlineDB.getPendingLogs();
        if (pendingLogs.length === 0) return { success: true, count: 0 };

        console.log(`[SyncManager] Attempting to sync ${pendingLogs.length} pending logs...`);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/adherence/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ logs: pendingLogs })
            });

            if (res.ok) {
                console.log('[SyncManager] Sync successful. Clearing pending logs.');
                await offlineDB.clearPendingLogs();
                return { success: true, count: pendingLogs.length };
            } else {
                console.error('[SyncManager] Sync failed:', await res.text());
                return { success: false, count: 0 };
            }
        } catch (err) {
            console.error('[SyncManager] Network error during sync:', err.message);
            return { success: false, count: 0 };
        }
    }
};
