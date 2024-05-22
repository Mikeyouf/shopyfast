import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
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
}) => (
  <Draggable key={category} draggableId={category} index={index}>
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

export default Category;
