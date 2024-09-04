import { Check, Delete, Edit } from "@mui/icons-material";
import { IconButton, TextField } from "@mui/material";
import React, { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { handleRenameCategory } from "../../services/itemService";
import { useToast } from "../layout/Toast"; // Importez le hook useToast
import ItemCard from "./ItemCard";
import { CategoryCard, CategoryTitle } from "./StyledComponents";

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
  const toast = useToast(); // Appel inconditionnel de useToast
  const [isEditing, setIsEditing] = useState(false);
  const [categoryName, setCategoryName] = useState(category);

  const handleCategoryRename = () => {
    handleRenameCategory(
      category,
      categoryName,
      items,
      setItems,
      listId,
      toast // Utilisez le hook useToast ici
    );
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCategoryRename();
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
            <div style={{ display: "flex", alignItems: "center" }}>
              {isEditing ? (
                <TextField
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              ) : (
                <CategoryTitle variant="h5" gutterBottom>
                  {category}
                </CategoryTitle>
              )}
              <IconButton onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <Check /> : <Edit />}
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(category, null, items, setItems, listId);
                }}
              >
                <Delete />
              </IconButton>
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
          </CategoryCard>
        </div>
      )}
    </Draggable>
  );
};

export default Category;
