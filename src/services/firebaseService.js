// services/firebaseService.js
import {
  get,
  push,
  ref,
  set,
  update
} from "firebase/database";
import {
  auth,
  database
} from "../config/firebase";

export const saveShoppingListToFirebase = async (list) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const userId = user.uid;
  const shoppingListsRef = ref(database, "users/" + userId + "/shoppingLists");

  try {
    // Récupère les listes existantes pour l'utilisateur
    const snapshot = await get(shoppingListsRef);

    if (snapshot.exists()) {
      const existingLists = snapshot.val();
      const existingListId = Object.keys(existingLists).find(
        key => existingLists[key].name === list.name
      );

      if (existingListId) {
        // Si la liste existe déjà, met à jour l'entrée existante
        const updateRef = ref(database, `users/${userId}/shoppingLists/${existingListId}`);
        await update(updateRef, list);
        console.log("Liste mise à jour avec succès !");
      } else {
        // Si la liste n'existe pas, crée une nouvelle entrée
        const newListRef = push(shoppingListsRef); // Générer une nouvelle clé unique pour la liste de courses
        await set(newListRef, list);
        console.log("Nouvelle liste créée avec succès !");
      }
    } else {
      // Si aucune liste n'existe, crée une nouvelle entrée
      const newListRef = push(shoppingListsRef); // Générer une nouvelle clé unique pour la liste de courses
      await set(newListRef, list);
      console.log("Nouvelle liste créée avec succès !");
    }
  } catch (error) {
    console.error("Error saving shopping list to Firebase:", error);
    throw error;
  }
};