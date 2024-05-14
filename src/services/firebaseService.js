import {
    database,
    auth
} from '../config/firebase';
import {
    ref,
    push,
    set
} from 'firebase/database';

export const saveShoppingListToFirebase = async(list) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const userId = user.uid;
    const shoppingListsRef = ref(database, 'shoppingLists/' + userId);

    try {
        const newListRef = push(shoppingListsRef); // Générer une nouvelle clé unique pour la liste de courses
        await set(newListRef, list);
    } catch (error) {
        console.error('Error saving shopping list to Firebase:', error);
        throw error;
    }
};