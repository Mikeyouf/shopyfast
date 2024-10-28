import { Draggable, Droppable } from "@hello-pangea/dnd";
import { AddCircle, Check, Delete, Edit } from "@mui/icons-material";
import { TextField } from "@mui/material";
import React, { useState } from "react";
import {
  handleRenameCategory,
  saveItemsToFirebase,
} from "../../services/itemService";
import { useToast } from "../layout/Toast";
import ItemCard from "./ItemCard";
import {
  CategoryCard,
  CategoryTitle,
  CustomIconButton,
} from "./StyledComponents";

const Category = ({
  category,
  categoryItems,
  index,
  handleEdit,
  handleDelete,
  toggleComplete,
  editItem,
  setEditItem,
  newItemName,
  setNewItemName,
  handleRename,
  setItems,
  listId,
  items,
  handleAddCategory,
}) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [categoryName, setCategoryName] = useState(category);
  const [newItem, setNewItem] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleCategoryRename = () => {
    handleRenameCategory(
      category,
      categoryName,
      items,
      setItems,
      listId,
      toast
    );
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCategoryRename();
    }
  };

  const handleAddItem = async () => {
    if (newItem.trim() === "") return;

    const updatedItems = items.map(([key, value]) => {
      if (key === category) {
        return [key, [...value, newItem]];
      }
      return [key, value];
    });

    setItems(updatedItems);
    setNewItem("");
    setIsAdding(false);

    try {
      await saveItemsToFirebase(updatedItems, listId);
      toast("Élément ajouté avec succès !", "success");
    } catch (error) {
      toast("Erreur lors de l'ajout de l'élément.", "error");
    }
  };

  return (
    <Draggable key={category} draggableId={category} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <CategoryCard>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {isEditing ? (
                <TextField
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              ) : (
                <CategoryTitle variant="h6" gutterBottom>
                  {category}
                </CategoryTitle>
              )}
              <div>
                <CustomIconButton onClick={() => setIsAdding(!isAdding)}>
                  <AddCircle />
                </CustomIconButton>
                <CustomIconButton onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? <Check /> : <Edit />}
                </CustomIconButton>
                <CustomIconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category, null, items, setItems, listId);
                  }}
                >
                  <Delete />
                </CustomIconButton>
              </div>
            </div>
            <Droppable droppableId={category} type="ITEM">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {categoryItems.map((item, itemIndex) => (
                    <ItemCard
                      key={`${category}-${itemIndex}`}
                      category={category}
                      item={item}
                      itemIndex={itemIndex}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                      toggleComplete={toggleComplete}
                      editItem={editItem}
                      setEditItem={setEditItem}
                      newItemName={newItemName}
                      setNewItemName={setNewItemName}
                      handleRename={handleRename}
                      setItems={setItems}
                      listId={listId}
                      items={items}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {isAdding && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <TextField
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Ajouter un nouvel élément"
                  fullWidth
                />
                <CustomIconButton onClick={handleAddItem}>
                  <Check />
                </CustomIconButton>
              </div>
            )}
          </CategoryCard>
        </div>
      )}
    </Draggable>
  );
};

export default Category;
