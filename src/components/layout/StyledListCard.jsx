import { Button, Card, Typography } from "@mui/material";
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
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(listId);
        }}
      >
        Effacer
      </Button>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onRename(listId);
        }}
      >
        Renommer
      </Button>
    </div>
  </StyledCard>
);

export default StyledListCard;
