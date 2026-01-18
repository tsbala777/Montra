// Firestore Database Service
// ==============================================
// Database Structure:
// └── users (collection)
//     └── {userId} (document)
//         ├── settings: UserSettings
//         ├── createdAt: timestamp
//         ├── updatedAt: timestamp
//         ├── email: string
//         ├── displayName: string
//         │
//         ├── transactions (subcollection)
//         │   └── {transactionId} (document)
//         │       ├── id: string
//         │       ├── amount: number
//         │       ├── description: string
//         │       ├── category: string
//         │       ├── date: string
//         │       ├── type: 'income' | 'expense'
//         │       ├── source?: string
//         │       └── createdAt: timestamp
//         │
//         ├── budgets (subcollection)
//         │   └── {category} (document)
//         │       ├── category: string
//         │       ├── limit: number
//         │       └── updatedAt: timestamp
//         │
//         └── goals (subcollection)
//             └── {goalId} (document)
//                 ├── id: string
//                 ├── name: string
//                 ├── targetAmount: number
//                 ├── currentAmount: number
//                 ├── icon: string
//                 ├── createdAt: timestamp
//                 └── updatedAt: timestamp
// ==============================================

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    Unsubscribe,
    writeBatch,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Transaction, Budget, SavingsGoal, UserSettings } from '../types';

// ========== USER DOCUMENT ==========

export interface UserDocument {
    email: string;
    displayName: string;
    settings: UserSettings;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Initialize a new user document when they first sign up
export const initializeUserDocument = async (
    userId: string,
    email: string,
    displayName: string,
    defaultSettings: UserSettings
): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    // Only create if document doesn't exist
    if (!userDoc.exists()) {
        await setDoc(userRef, {
            email,
            displayName,
            settings: defaultSettings,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('✅ User document initialized in Firestore');
    }
};

// Get user document
export const getUserDocument = async (userId: string): Promise<UserDocument | null> => {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserDocument;
    }
    return null;
};

// Update user profile info
export const updateUserProfile = async (
    userId: string,
    updates: { displayName?: string; email?: string }
): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
};

// ========== USER SETTINGS ==========

export const saveUserSettings = async (userId: string, settings: UserSettings): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
        settings,
        updatedAt: serverTimestamp()
    }, { merge: true });
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data().settings || null;
    }
    return null;
};

export const subscribeToSettings = (userId: string, callback: (settings: UserSettings | null) => void): Unsubscribe => {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data().settings || null);
        } else {
            callback(null);
        }
    });
};

// ========== TRANSACTIONS ==========
// Subcollection: users/{userId}/transactions/{transactionId}

export const saveTransaction = async (userId: string, transaction: Transaction): Promise<void> => {
    try {
        const transactionRef = doc(db, 'users', userId, 'transactions', transaction.id);
        // Remove undefined values (Firestore doesn't accept undefined)
        const cleanTransaction = Object.fromEntries(
            Object.entries(transaction).filter(([_, value]) => value !== undefined)
        );
        await setDoc(transactionRef, {
            ...cleanTransaction,
            createdAt: serverTimestamp()
        });
        console.log('✅ Transaction saved:', transaction.description);
    } catch (error) {
        console.error('❌ Error saving transaction:', error);
        throw error;
    }
};

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(transactionsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as Transaction));
};

export const deleteTransaction = async (userId: string, transactionId: string): Promise<void> => {
    try {
        const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
        await deleteDoc(transactionRef);
        console.log('✅ Transaction deleted:', transactionId);
    } catch (error) {
        console.error('❌ Error deleting transaction:', error);
        throw error;
    }
};

export const subscribeToTransactions = (userId: string, callback: (transactions: Transaction[]) => void): Unsubscribe => {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(transactionsRef, orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const transactions = snapshot.docs.map(doc => ({ ...doc.data() } as Transaction));
        callback(transactions);
    }, (error) => {
        console.error('Error subscribing to transactions:', error);
        callback([]);
    });
};

// ========== BUDGETS ==========
// Subcollection: users/{userId}/budgets/{category}

export const saveBudget = async (userId: string, budget: Budget): Promise<void> => {
    try {
        // Use category as the document ID for easy updates
        const budgetRef = doc(db, 'users', userId, 'budgets', budget.category.toString());
        await setDoc(budgetRef, {
            ...budget,
            updatedAt: serverTimestamp()
        });
        console.log('✅ Budget saved:', budget.category);
    } catch (error) {
        console.error('❌ Error saving budget:', error);
        throw error;
    }
};

export const getBudgets = async (userId: string): Promise<Budget[]> => {
    const budgetsRef = collection(db, 'users', userId, 'budgets');
    const querySnapshot = await getDocs(budgetsRef);
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as Budget));
};

export const deleteBudget = async (userId: string, category: string): Promise<void> => {
    try {
        const budgetRef = doc(db, 'users', userId, 'budgets', category);
        await deleteDoc(budgetRef);
        console.log('✅ Budget deleted:', category);
    } catch (error) {
        console.error('❌ Error deleting budget:', error);
        throw error;
    }
};

export const subscribeToBudgets = (userId: string, callback: (budgets: Budget[]) => void): Unsubscribe => {
    const budgetsRef = collection(db, 'users', userId, 'budgets');
    return onSnapshot(budgetsRef, (snapshot) => {
        const budgets = snapshot.docs.map(doc => ({ ...doc.data() } as Budget));
        callback(budgets);
    }, (error) => {
        console.error('Error subscribing to budgets:', error);
        callback([]);
    });
};

// ========== SAVINGS GOALS ==========
// Subcollection: users/{userId}/goals/{goalId}

export const saveGoal = async (userId: string, goal: SavingsGoal): Promise<void> => {
    try {
        const goalRef = doc(db, 'users', userId, 'goals', goal.id);
        await setDoc(goalRef, {
            ...goal,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('✅ Goal saved:', goal.name);
    } catch (error) {
        console.error('❌ Error saving goal:', error);
        throw error;
    }
};

export const getGoals = async (userId: string): Promise<SavingsGoal[]> => {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const querySnapshot = await getDocs(goalsRef);
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as SavingsGoal));
};

export const updateGoal = async (userId: string, goalId: string, updates: Partial<SavingsGoal>): Promise<void> => {
    try {
        const goalRef = doc(db, 'users', userId, 'goals', goalId);
        await updateDoc(goalRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        console.log('✅ Goal updated:', goalId);
    } catch (error) {
        console.error('❌ Error updating goal:', error);
        throw error;
    }
};

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
    try {
        const goalRef = doc(db, 'users', userId, 'goals', goalId);
        await deleteDoc(goalRef);
        console.log('✅ Goal deleted:', goalId);
    } catch (error) {
        console.error('❌ Error deleting goal:', error);
        throw error;
    }
};

export const subscribeToGoals = (userId: string, callback: (goals: SavingsGoal[]) => void): Unsubscribe => {
    const goalsRef = collection(db, 'users', userId, 'goals');
    return onSnapshot(goalsRef, (snapshot) => {
        const goals = snapshot.docs.map(doc => ({ ...doc.data() } as SavingsGoal));
        callback(goals);
    }, (error) => {
        console.error('Error subscribing to goals:', error);
        callback([]);
    });
};

// ========== BATCH OPERATIONS ==========

export const saveAllData = async (
    userId: string,
    data: {
        transactions?: Transaction[];
        budgets?: Budget[];
        goals?: SavingsGoal[];
        settings?: UserSettings;
    }
): Promise<void> => {
    const batch = writeBatch(db);

    if (data.settings) {
        const userRef = doc(db, 'users', userId);
        batch.set(userRef, {
            settings: data.settings,
            updatedAt: serverTimestamp()
        }, { merge: true });
    }

    if (data.transactions) {
        for (const transaction of data.transactions) {
            const transactionRef = doc(db, 'users', userId, 'transactions', transaction.id);
            batch.set(transactionRef, {
                ...transaction,
                createdAt: serverTimestamp()
            });
        }
    }

    if (data.budgets) {
        for (const budget of data.budgets) {
            const budgetRef = doc(db, 'users', userId, 'budgets', budget.category.toString());
            batch.set(budgetRef, {
                ...budget,
                updatedAt: serverTimestamp()
            });
        }
    }

    if (data.goals) {
        for (const goal of data.goals) {
            const goalRef = doc(db, 'users', userId, 'goals', goal.id);
            batch.set(goalRef, {
                ...goal,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    }

    await batch.commit();
};

// ========== MIGRATE LOCAL DATA ==========

export const migrateLocalDataToFirestore = async (userId: string): Promise<boolean> => {
    // Migration disabled to ensure fresh start for all new logins
    // We don't want to import potentially stale or sample data from local storage
    return false;

    /* Legacy migration logic preserved for reference but disabled:
    try {
        // ... (original logic)
    } catch (error) {
        console.error('Migration failed:', error);
        return false;
    }
    */
};

// ========== DELETE ALL USER DATA ==========

export const deleteAllUserData = async (userId: string): Promise<void> => {
    const batch = writeBatch(db);

    // Delete all transactions
    const transactionsSnapshot = await getDocs(collection(db, 'users', userId, 'transactions'));
    transactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete all budgets
    const budgetsSnapshot = await getDocs(collection(db, 'users', userId, 'budgets'));
    budgetsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete all goals
    const goalsSnapshot = await getDocs(collection(db, 'users', userId, 'goals'));
    goalsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete user document
    batch.delete(doc(db, 'users', userId));

    await batch.commit();
    console.log('🗑️ All user data deleted from Firestore');
};
