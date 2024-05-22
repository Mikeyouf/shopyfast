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

const SidePanel = ({ open, onClose, selectedList, listId }) => {
  const [items, setItems] = useState([]);
  const auth = getAuth();
  const db = getDatabase();

  console.log("listId: ", listId);

  useEffect(() => {
    if (selectedList) {
      const newItems = Object.entries(selectedList).filter(
        ([key, value]) => key !== "order" && Array.isArray(value)
      );
      setItems(newItems);
    }
  }, [selectedList]);

  const [editItem, setEditItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const sourceCategory = result.source.droppableId;
    const destinationCategory = result.destination.droppableId;

    let updatedItems = [];

    if (sourceCategory === destinationCategory) {
      // Reorder within the same category
      const categoryItems = items.find(([key]) => key === sourceCategory)[1];
      const [movedItem] = categoryItems.splice(sourceIndex, 1);
      categoryItems.splice(destinationIndex, 0, movedItem);

      updatedItems = items.map(([key, value]) =>
        key === sourceCategory ? [key, categoryItems] : [key, value]
      );
      setItems(updatedItems);
    } else {
      // Move between categories
      const sourceItems = items.find(([key]) => key === sourceCategory)[1];
      const destinationItems = items.find(
        ([key]) => key === destinationCategory
      )[1];

      const [movedItem] = sourceItems.splice(sourceIndex, 1);
      destinationItems.splice(destinationIndex, 0, movedItem);

      updatedItems = items.map(([key, value]) => {
        if (key === sourceCategory) {
          return [key, sourceItems];
        } else if (key === destinationCategory) {
          return [key, destinationItems];
        }
        return [key, value];
      });

      setItems(updatedItems);
    }

    // Réindexer les éléments après le drag-and-drop
    const reindexedItems = updatedItems.map(([key, value]) => [
      key,
      value.map((item, index) =>
        typeof item === "object"
          ? { ...item, index }
          : { name: item, completed: false, index }
      ),
    ]);

    setItems(reindexedItems);

    // Save the updated order to Firebase
    saveItemsToFirebase(reindexedItems);
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
    console.log("updatedItems : ", updatedItems);

    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const updates = {
        [`users/${userId}/shoppingLists/${listId}/${editItem.category}/${editItem.itemIndex}/name`]:
          newItemName,
      };
      console.log("updates : ", updates);
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
    // Vérifiez si l'élément est en mode édition
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

      // Si l'item est une chaîne de caractères, assurez-vous de le convertir en objet correctement
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
            {items.map(([category, categoryItems]) => (
              <Droppable droppableId={category} key={category}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <Typography variant="h5" gutterBottom>
                      {category}
                    </Typography>
                    {categoryItems.map((item, index) => (
                      <Draggable
                        key={`${category}-${index}`}
                        draggableId={`${category}-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <StyledCard
                              className={
                                typeof item === "object" && item.completed
                                  ? "completed"
                                  : ""
                              }
                              onClick={() => toggleComplete(category, index)}
                            >
                              {editItem?.category === category &&
                              editItem.itemIndex === index ? (
                                <TextField
                                  value={newItemName}
                                  onChange={(e) =>
                                    setNewItemName(e.target.value)
                                  }
                                />
                              ) : (
                                <Typography variant="h6">
                                  {typeof item === "object" ? item.name : item}
                                </Typography>
                              )}
                              <div>
                                {editItem?.category === category &&
                                editItem.itemIndex === index ? (
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
                                      handleEdit(category, index);
                                    }}
                                  >
                                    <Edit />
                                  </IconButton>
                                )}
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(category, index);
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
            ))}
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
