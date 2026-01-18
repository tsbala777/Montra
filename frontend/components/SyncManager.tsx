import { useEffect } from 'react';
import { dbPromise, getQueue, removeFromQueue } from '../lib/db';
import { saveTransaction } from '../services/firestoreService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Transaction } from '../types';

export const SyncManager = () => {
    const isOnline = useOnlineStatus();

    useEffect(() => {
        const syncData = async () => {
            if (isOnline) {
                try {
                    console.log('Online detected. Checking sync queue...');
                    const queue = await getQueue();
                    if (queue.length > 0) {
                        console.log(`Found ${queue.length} items to sync.`);
                        for (const item of queue) {
                            try {
                                // We directly call the firestore setDoc logic here
                                // Ideally we should bypass the "check online" check of saveTransaction 
                                // or we expose a direct "pushToFirestore" method.
                                // For now, saveTransaction will check online (which is true) and save it.
                                await saveTransaction(item.userId, item as Transaction);
                                await removeFromQueue(item.id);
                                console.log(`Synced item ${item.id}`);
                            } catch (e) {
                                console.error('Failed to sync item', item.id, e);
                            }
                        }
                        // Trigger a reload or event if needed, but Firestore subscription should handle it
                    }
                } catch (error) {
                    console.error('Sync error:', error);
                }
            }
        };

        if (isOnline) {
            syncData();
        }
    }, [isOnline]);

    return null;
};
