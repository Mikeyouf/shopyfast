// src/context/ShoppingListContext.jsx
import { getAuth } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { createContext, useContext, useEffect, useState } from "react";

const ShoppingListContext = createContext();

export const useShoppingList = () => {
  return useContext(ShoppingListContext);
};

export const ShoppingListProvider = ({ children }) => {
  const [shoppingLists, setShoppingLists] = useState([]);
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const listRef = ref(db, "users/" + userId + "/shoppingLists");

    const unsubscribe = onValue(listRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lists = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        const orderedLists = lists.sort((a, b) => (a.order > b.order ? 1 : -1));
        setShoppingLists(orderedLists);
      } else {
        setShoppingLists([]);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe(); // Nettoyer l'abonnement
      } else {
        console.error("unsubscribe is not a function");
      }
    };
  }, [auth, db]);

  return (
    <ShoppingListContext.Provider value={{ shoppingLists, setShoppingLists }}>
      {children}
    </ShoppingListContext.Provider>
  );
};
