import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useEffect } from "react";

const RenameDialog = ({
  open,
  onClose,
  currentListName,
  newListName,
  setNewListName,
  onRenameConfirm,
}) => {
  useEffect(() => {
    if (open) {
      setNewListName(currentListName || "");
    }
  }, [open, currentListName, setNewListName]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onRenameConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Renommer la liste de courses</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="newListName"
          label="Nouveau nom"
          type="text"
          fullWidth
          value={newListName || ""}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={onRenameConfirm}>Confirmer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameDialog;
