import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Card, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";

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
});

const StyledListCard = ({
  listId,
  listName,
  onOpenSidePanel,
  onDelete,
  onRename,
}) => (
  <StyledCard onClick={() => onOpenSidePanel(listId)}>
    <Typography variant="h6">{listName ? listName : listId}</Typography>
    <div>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onRename(listId);
        }}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onDelete(listId);
        }}
      >
        <DeleteIcon />
      </IconButton>
    </div>
  </StyledCard>
);

export default StyledListCard;
