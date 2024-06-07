import { Check, Delete, Edit } from "@mui/icons-material";
import { IconButton, TextField } from "@mui/material";
import React, { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { handleRenameCategory } from "../../services/itemService"; // Importez la fonction
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
  const [isEditing, setIsEditing] = useState(false);
  const [categoryName, setCategoryName] = useState(category);

  const handleCategoryRename = () => {
    handleRenameCategory(category, categoryName, items, setItems, listId);
    setIsEditing(false);
  };

  const onDelete = (e) => {
    e.stopPropagation();
    if (category) {
      handleDelete(category, null, items, setItems, listId);
    } else {
      console.error("Category is undefined or null");
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
                  autoFocus
                />
              ) : (
                <CategoryTitle variant="h5" gutterBottom>
                  {category}
                </CategoryTitle>
              )}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (isEditing) {
                    handleCategoryRename();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? <Check /> : <Edit />}
              </IconButton>
              <IconButton onClick={onDelete}>
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
