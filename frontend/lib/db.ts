import { openDB } from "idb";

const DB_NAME = "montra-db";
const STORE_NAME = "syncQueue";

export const dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
    },
});

export async function addToQueue(item: any) {
    const db = await dbPromise;
    return db.put(STORE_NAME, item);
}

export async function getQueue() {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
}

export async function removeFromQueue(id: string) {
    const db = await dbPromise;
    return db.delete(STORE_NAME, id);
}
