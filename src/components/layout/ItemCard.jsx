import { Check, Delete, Edit } from "@mui/icons-material";
import { IconButton, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";
import { StyledCard } from "./StyledComponents";

const ItemCard = ({
  category,
  item,
  itemIndex,
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
}) => {
  const checkButtonRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleRename(
        editItem,
        newItemName,
        items,
        setItems,
        setEditItem,
        setNewItemName,
        listId
      );
    };

    const button = checkButtonRef.current;
    if (button) {
      button.addEventListener("click", handleClick);
    }

    return () => {
      if (button) {
        button.removeEventListener("click", handleClick);
      }
    };
  }, [
    editItem,
    newItemName,
    items,
    setItems,
    setEditItem,
    setNewItemName,
    listId,
    handleRename,
  ]);

  return (
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
              typeof item === "object" && item.completed ? "completed" : ""
            }
            onClick={() =>
              toggleComplete(category, itemIndex, items, setItems, listId)
            }
          >
            {editItem?.category === category &&
            editItem.itemIndex === itemIndex ? (
              <TextField
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            ) : (
              <Typography variant="h6">
                {typeof item === "object" ? item.name : item}
              </Typography>
            )}
            <div>
              {editItem?.category === category &&
              editItem.itemIndex === itemIndex ? (
                <IconButton ref={checkButtonRef}>
                  <Check />
                </IconButton>
              ) : (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(
                      category,
                      itemIndex,
                      items,
                      setEditItem,
                      setNewItemName
                    );
                  }}
                >
                  <Edit />
                </IconButton>
              )}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(category, itemIndex, items, setItems, listId);
                }}
              >
                <Delete />
              </IconButton>
            </div>
          </StyledCard>
        </div>
      )}
    </Draggable>
  );
};

export default ItemCard;
