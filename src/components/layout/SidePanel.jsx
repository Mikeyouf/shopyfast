import { Check, Close, Delete, Edit } from "@mui/icons-material";
import {
  Button,
  Card,
  Drawer,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const StyledDrawer = styled(Drawer)({
  "& .MuiDrawer-paper": {
    width: "100%",
    maxWidth: "600px",
    padding: "8px",
  },
});

const CloseButton = styled(Button)({
  position: "absolute",
  top: "10px",
  right: "10px",
});

const StyledCard = styled(Card)({
  marginBottom: "10px",
  padding: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  "&:hover": {
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
  },
  "&.completed": {
    textDecoration: "line-through",
  },
});

const CategoryCard = styled(Card)({
  marginBottom: "20px",
  padding: "10px",
  backgroundColor: "#e0e0e0",
});

const CategoryTitle = styled(Typography)({
  fontWeight: "bold",
});

const SidePanel = ({ open, onClose, selectedList, listId }) => {
  const [items, setItems] = useState([]);
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    if (selectedList) {
      const newItems = Object.entries(selectedList).filter(
        ([key, value]) => key !== "order" && Array.isArray(value)
      );

      // Trier les catégories en fonction de orderCategory
      newItems.sort((a, b) => {
        const orderA = selectedList.orderCategory?.[a[0]] ?? 0;
        const orderB = selectedList.orderCategory?.[b[0]] ?? 0;
        return orderA - orderB;
      });

      setItems(newItems);
    }
  }, [selectedList]);

  const [editItem, setEditItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");

  const onDragEnd = (result) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "CATEGORY") {
      const newItems = Array.from(items);
      const [movedCategory] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedCategory);
      setItems(newItems);
      saveCategoriesOrderToFirebase(newItems);
      return;
    }

    const start = items.find(([key]) => key === source.droppableId);
    const finish = items.find(([key]) => key === destination.droppableId);

    if (!start || !finish) {
      console.error("Start or finish is undefined");
      return;
    }

    let updatedItems = [...items];

    if (start === finish) {
      const categoryItems = Array.from(start[1]);
      const [movedItem] = categoryItems.splice(source.index, 1);
      categoryItems.splice(destination.index, 0, movedItem);

      updatedItems = items.map(([key, value]) =>
        key === source.droppableId ? [key, categoryItems] : [key, value]
      );
    } else {
      const startItems = Array.from(start[1]);
      const finishItems = Array.from(finish[1]);
      const [movedItem] = startItems.splice(source.index, 1);
      finishItems.splice(destination.index, 0, movedItem);

      updatedItems = items.map(([key, value]) => {
        if (key === source.droppableId) {
          return [key, startItems];
        }
        if (key === destination.droppableId) {
          return [key, finishItems];
        }
        return [key, value];
      });
    }

    setItems(updatedItems);
    saveItemsToFirebase(updatedItems);
  };

  const saveCategoriesOrderToFirebase = (categories) => {
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

  const saveItemsToFirebase = (items) => {
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

  const handleEdit = (category, itemIndex) => {
    const item = items.find(([key]) => key === category)[1][itemIndex];
    setEditItem({ category, itemIndex });
    setNewItemName(typeof item === "object" ? item.name : item);
  };

  const handleDelete = (category, itemIndex) => {
    const newItems = items.map(([key, value]) =>
      key === category
        ? [key, value.filter((_, index) => index !== itemIndex)]
        : [key, value]
    );

    // Réindexer les éléments après la suppression
    const reindexedItems = newItems.map(([key, value]) =>
      key === category
        ? [
            key,
            value.map((item, index) =>
              typeof item === "object"
                ? { ...item, index }
                : { name: item, completed: false, index }
            ),
          ]
        : [key, value]
    );

    setItems(reindexedItems);

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

  const handleRename = () => {
    if (!editItem || !newItemName.trim()) {
      return;
    }

    const updatedItems = items.map(([key, value]) =>
      key === editItem.category
        ? [
            key,
            value.map((item, index) =>
              index === editItem.itemIndex
                ? { ...item, name: newItemName }
                : item
            ),
          ]
        : [key, value]
    );
    setItems(updatedItems);

    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const updates = {
        [`users/${userId}/shoppingLists/${listId}/${editItem.category}/${editItem.itemIndex}/name`]:
          newItemName,
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

  const toggleComplete = (category, itemIndex) => {
    if (
      editItem &&
      editItem.category === category &&
      editItem.itemIndex === itemIndex
    ) {
      return;
    }

    const updatedItems = items.map(([key, value]) =>
      key === category
        ? [
            key,
            value.map((item, index) =>
              index === itemIndex
                ? typeof item === "object"
                  ? { ...item, completed: !item.completed }
                  : { name: item, completed: true }
                : item
            ),
          ]
        : [key, value]
    );
    setItems(updatedItems);

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

  return (
    <StyledDrawer anchor="right" open={open} onClose={onClose}>
      <div>
        <CloseButton onClick={onClose}>
          <Close />
        </CloseButton>
        {items.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="categories" type="CATEGORY">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {items.map(([category, categoryItems], index) => (
                    <Draggable
                      key={category}
                      draggableId={category}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <CategoryCard>
                            <CategoryTitle variant="h5" gutterBottom>
                              {category}
                            </CategoryTitle>
                            <Droppable droppableId={category} type="ITEM">
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                >
                                  {categoryItems.map((item, itemIndex) => (
                                    <Draggable
                                      key={`${category}-${itemIndex}`}
                                      draggableId={`${category}-${itemIndex}`}
                                      index={itemIndex}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <StyledCard
                                            className={
                                              typeof item === "object" &&
                                              item.completed
                                                ? "completed"
                                                : ""
                                            }
                                            onClick={() =>
                                              toggleComplete(
                                                category,
                                                itemIndex
                                              )
                                            }
                                          >
                                            {editItem?.category === category &&
                                            editItem.itemIndex === itemIndex ? (
                                              <TextField
                                                value={newItemName}
                                                onChange={(e) =>
                                                  setNewItemName(e.target.value)
                                                }
                                              />
                                            ) : (
                                              <Typography variant="h6">
                                                {typeof item === "object"
                                                  ? item.name
                                                  : item}
                                              </Typography>
                                            )}
                                            <div>
                                              {editItem?.category ===
                                                category &&
                                              editItem.itemIndex ===
                                                itemIndex ? (
                                                <IconButton
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRename();
                                                  }}
                                                >
                                                  <Check />
                                                </IconButton>
                                              ) : (
                                                <IconButton
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(
                                                      category,
                                                      itemIndex
                                                    );
                                                  }}
                                                >
                                                  <Edit />
                                                </IconButton>
                                              )}
                                              <IconButton
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDelete(
                                                    category,
                                                    itemIndex
                                                  );
                                                }}
                                              >
                                                <Delete />
                                              </IconButton>
                                            </div>
                                          </StyledCard>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </CategoryCard>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <Typography variant="body1" gutterBottom>
            Cliquez sur l'appareil photo pour ajouter des articles à cette
            liste.
          </Typography>
        )}
      </div>
    </StyledDrawer>
  );
};

export default SidePanel;
