// services/firebaseService.js
import { push, ref, set } from "firebase/database";
import { auth, database } from "../config/firebase";

export const saveShoppingListToFirebase = async (list) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const userId = user.uid;
  const shoppingListsRef = ref(database, "users/" + userId + "/shoppingLists");

  try {
    const newListRef = push(shoppingListsRef); // Générer une nouvelle clé unique pour la liste de courses
    await set(newListRef, list);
  } catch (error) {
    console.error("Error saving shopping list to Firebase:", error);
    throw error;
  }
};
