import { Close } from "@mui/icons-material";
import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import {
  handleDelete,
  handleEdit,
  handleRename,
  saveCategoriesOrderToFirebase,
  saveItemsToFirebase,
  toggleComplete,
} from "../../services/itemService";
import Category from "./Category";
import { CloseButton, StyledDrawer } from "./StyledComponents";

const SidePanel = ({ open, onClose, selectedList, listId }) => {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");

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
      saveCategoriesOrderToFirebase(newItems, listId);
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
    saveItemsToFirebase(updatedItems, listId);
  };

  return (
    <StyledDrawer anchor="right" open={open} onClose={onClose}>
      <div>
        <CloseButton onClick={onClose}>
          <Close />
        </CloseButton>
        {Array.isArray(items) && items.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="categories" type="CATEGORY">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {items.map(([category, categoryItems], index) => (
                    <Category
                      key={category}
                      category={category}
                      categoryItems={categoryItems}
                      index={index}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                      toggleComplete={toggleComplete}
                      editItem={editItem}
                      setEditItem={setEditItem}
                      newItemName={newItemName}
                      setNewItemName={setNewItemName}
                      handleRename={() =>
                        handleRename(
                          editItem,
                          newItemName,
                          items,
                          setItems,
                          setEditItem,
                          setNewItemName,
                          listId
                        )
                      }
                      setItems={setItems}
                      listId={listId}
                      items={items}
                    />
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
