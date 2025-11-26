// Simple in-memory store for status updates
// Key: wamid (WhatsApp Message ID), Value: Status string
// Note: This resets on server restart.

const globalStore = globalThis;

if (!globalStore.statusStore) {
    globalStore.statusStore = {};
}

export const getStatusStore = () => globalStore.statusStore;

export const updateStatusStore = (id, status) => {
    globalStore.statusStore[id] = status;
};

export const getStatus = (id) => {
    return globalStore.statusStore[id] || 'unknown';
};
