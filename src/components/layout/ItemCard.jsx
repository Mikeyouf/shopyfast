import { Draggable } from "@hello-pangea/dnd";
import { Check, Delete, Edit } from "@mui/icons-material";
import { IconButton, TextField, Typography } from "@mui/material";
import { styled } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import { StyledCard } from "./StyledComponents";

const MobileStyledCard = styled(StyledCard)({
  "@media (max-width: 767px)": {
    flexDirection: "row",
    alignItems: "center",
    padding: "10px",
  },
});

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
  const [isEditing, setIsEditing] = useState(false);

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
      setIsEditing(false); // Reset isEditing state after rename
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRename(
        editItem,
        newItemName,
        items,
        setItems,
        setEditItem,
        setNewItemName,
        listId
      );
      setIsEditing(false); // Reset isEditing state after rename
    }
  };

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
          <MobileStyledCard
            className={
              typeof item === "object" && item.completed ? "completed" : ""
            }
            onClick={(e) => {
              if (!isEditing) {
                e.stopPropagation();
                toggleComplete(category, itemIndex, items, setItems, listId);
              }
            }}
          >
            {editItem?.category === category &&
            editItem.itemIndex === itemIndex ? (
              <TextField
                value={newItemName}
                onChange={(e) => {
                  e.stopPropagation();
                  setNewItemName(e.target.value);
                }}
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <Typography variant="h6">
                {typeof item === "object" ? item.name : item}
              </Typography>
            )}
            <div>
              {editItem?.category === category &&
              editItem.itemIndex === itemIndex ? (
                <IconButton
                  ref={checkButtonRef}
                  onClick={(e) => e.stopPropagation()}
                >
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
                    setIsEditing(true);
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
          </MobileStyledCard>
        </div>
      )}
    </Draggable>
  );
};

export default ItemCard;
