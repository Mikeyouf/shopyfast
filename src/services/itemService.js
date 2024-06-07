import {
  getAuth
} from "firebase/auth";
import {
  getDatabase,
  ref,
  update
} from "firebase/database";

export const saveCategoriesOrderToFirebase = (categories, listId) => {
  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;
  if (!user) return;

  const userId = user.uid;
  const updates = {};

  categories.forEach(([category], index) => {
    updates[
      `users/${userId}/shoppingLists/${listId}/orderCategory/${category}`
    ] = index;
  });

  update(ref(db), updates);
};

export const saveItemsToFirebase = (items, listId) => {
  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;
  if (!user) return;

  const userId = user.uid;
  const updates = {};

  items.forEach(([category, categoryItems]) => {
    updates[`users/${userId}/shoppingLists/${listId}/${category}`] =
      categoryItems;
  });

  update(ref(db), updates);
};

export const handleEdit = (category, itemIndex, items, setEditItem, setNewItemName) => {
  if (!Array.isArray(items)) {
    console.error("items is not an array");
    return;
  }

  const item = items.find(([key]) => key === category)[1][itemIndex];
  setEditItem({
    category,
    itemIndex
  });
  setNewItemName(typeof item === "object" ? item.name : item);
};

export const handleDelete = (category, itemIndex, items, setItems, listId) => {
  if (!Array.isArray(items)) {
    console.error("items is not an array");
    return;
  }

  const newItems = items.map(([key, value]) =>
    key === category ? [key, value.filter((_, index) => index !== itemIndex)] : [key, value]
  );

  // Réindexer les éléments après la suppression
  const reindexedItems = newItems.map(([key, value]) =>
    key === category ? [
      key,
      value.map((item, index) =>
        typeof item === "object" ? {
          ...item,
          index
        } : {
          name: item,
          completed: false,
          index
        }
      ),
    ] : [key, value]
  );

  setItems(reindexedItems);

  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const updates = {};

    reindexedItems.forEach(([category, categoryItems]) => {
      updates[`users/${userId}/shoppingLists/${listId}/${category}`] =
        categoryItems;
    });

    update(ref(db), updates);
  }
};

export const handleRename = (editItem, newItemName, items, setItems, setEditItem, setNewItemName, listId) => {
  if (!editItem || !newItemName.trim()) {
    return;
  }

  if (!Array.isArray(items)) {
    console.error("items is not an array");
    return;
  }

  const updatedItems = items.map(([key, value]) =>
    key === editItem.category ? [
      key,
      value.map((item, index) =>
        index === editItem.itemIndex ? {
          ...item,
          name: newItemName
        } // Ne changez pas l'état `completed`
        :
        item
      ),
    ] : [key, value]
  );

  setItems(updatedItems);

  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const updates = {
      [`users/${userId}/shoppingLists/${listId}/${editItem.category}/${editItem.itemIndex}/name`]: newItemName,
    };
    update(ref(db), updates)
      .then(() => {
        console.log("Item updated successfully");
      })
      .catch((error) => {
        console.error("Error updating item: ", error);
      });
  }

  setEditItem(null);
  setNewItemName("");
};

export const toggleComplete = (category, itemIndex, items, setItems, listId) => {
  if (!Array.isArray(items)) {
    console.error("items is not an array");
    return;
  }

  const updatedItems = items.map(([key, value]) =>
    key === category ? [
      key,
      value.map((item, index) =>
        index === itemIndex ?
        typeof item === "object" ? {
          ...item,
          completed: !item.completed
        } : {
          name: item,
          completed: true
        } :
        item
      ),
    ] : [key, value]
  );
  setItems(updatedItems);

  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const item = items.find(([key]) => key === category)[1][itemIndex];
    const updates = {
      [`users/${userId}/shoppingLists/${listId}/${category}/${itemIndex}`]: {
        ...item,
        completed: !item.completed,
      },
    };

    if (typeof item === "string") {
      updates[
        `users/${userId}/shoppingLists/${listId}/${category}/${itemIndex}`
      ] = {
        name: item,
        completed: !item.completed,
      };
    }

    update(ref(db), updates);
  }
};

export const handleRenameCategory = (
  oldCategoryName,
  newCategoryName,
  items,
  setItems,
  listId
) => {
  if (!newCategoryName.trim()) {
    console.error("Le nouveau nom de la catégorie ne peut pas être vide.");
    return;
  }

  // Vérifier si la catégorie existe déjà
  const categoryExists = items.some(([key]) => key === newCategoryName);
  if (categoryExists) {
    console.error("Une catégorie avec ce nom existe déjà.");
    return;
  }

  // Mettre à jour les items localement
  const updatedItems = items.map(([key, value]) =>
    key === oldCategoryName ? [newCategoryName, value] : [key, value]
  );
  setItems(updatedItems);

  // Mettre à jour Firebase
  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const updates = {
      [`users/${userId}/shoppingLists/${listId}/orderCategory/${newCategoryName}`]: items.find(([key]) => key === oldCategoryName)[1],
      [`users/${userId}/shoppingLists/${listId}/${newCategoryName}`]: items.find(([key]) => key === oldCategoryName)[1],
      [`users/${userId}/shoppingLists/${listId}/${oldCategoryName}`]: null,
    };
    update(ref(db), updates)
      .then(() => {
        console.log("Catégorie renommée avec succès");
      })
      .catch((error) => {
        console.error("Erreur lors du renommage de la catégorie : ", error);
      });
  }
};