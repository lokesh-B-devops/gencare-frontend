/**
 * IndexedDB Wrapper for Offline Medication Storage
 */
const DB_NAME = 'hospi-offline-db';
const DB_VERSION = 1;

const STORES = {
    MEDICATIONS: 'medications',
    INSTRUCTIONS: 'instructions',
    PENDING_LOGS: 'pending_logs'
};

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORES.MEDICATIONS)) {
                db.createObjectStore(STORES.MEDICATIONS, { keyPath: 'name' });
            }
            if (!db.objectStoreNames.contains(STORES.INSTRUCTIONS)) {
                db.createObjectStore(STORES.INSTRUCTIONS, { keyPath: 'medName' });
            }
            if (!db.objectStoreNames.contains(STORES.PENDING_LOGS)) {
                db.createObjectStore(STORES.PENDING_LOGS, { autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const dbOp = async (storeName, mode, callback) => {
    const db = await openDB();
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
        const result = callback(store);
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
    });
};

export const offlineDB = {
    // Medications
    saveMedications: async (medications) => {
        const db = await openDB();
        const transaction = db.transaction(STORES.MEDICATIONS, 'readwrite');
        const store = transaction.objectStore(STORES.MEDICATIONS);
        store.clear();
        medications.forEach(med => store.put(med));
        return new Promise((resolve) => transaction.oncomplete = () => resolve());
    },
    getMedications: async () => {
        const db = await openDB();
        return new Promise((resolve) => {
            const request = db.transaction(STORES.MEDICATIONS).objectStore(STORES.MEDICATIONS).getAll();
            request.onsuccess = () => resolve(request.result);
        });
    },

    // Instructions
    saveInstructions: async (instructions) => {
        const db = await openDB();
        const transaction = db.transaction(STORES.INSTRUCTIONS, 'readwrite');
        const store = transaction.objectStore(STORES.INSTRUCTIONS);
        Object.entries(instructions).forEach(([medName, info]) => {
            store.put({ medName, ...info });
        });
        return new Promise((resolve) => transaction.oncomplete = () => resolve());
    },
    getInstructions: async () => {
        const db = await openDB();
        return new Promise((resolve) => {
            const request = db.transaction(STORES.INSTRUCTIONS).objectStore(STORES.INSTRUCTIONS).getAll();
            request.onsuccess = () => {
                const map = {};
                request.result.forEach(item => {
                    const { medName, ...info } = item;
                    map[medName] = info;
                });
                resolve(map);
            };
        });
    },

    // Pending Logs (Sync Queue)
    addPendingLog: async (log) => {
        const db = await openDB();
        const transaction = db.transaction(STORES.PENDING_LOGS, 'readwrite');
        transaction.objectStore(STORES.PENDING_LOGS).add({
            ...log,
            offlineTimestamp: new Date().toISOString()
        });
        return new Promise((resolve) => transaction.oncomplete = () => resolve());
    },
    getPendingLogs: async () => {
        const db = await openDB();
        return new Promise((resolve) => {
            const request = db.transaction(STORES.PENDING_LOGS).objectStore(STORES.PENDING_LOGS).getAll();
            request.onsuccess = () => resolve(request.result);
        });
    },
    clearPendingLogs: async () => {
        const db = await openDB();
        const transaction = db.transaction(STORES.PENDING_LOGS, 'readwrite');
        transaction.objectStore(STORES.PENDING_LOGS).clear();
        return new Promise((resolve) => transaction.oncomplete = () => resolve());
    }
};
