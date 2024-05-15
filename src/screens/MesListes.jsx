import { Close } from "@mui/icons-material";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { getAuth } from "firebase/auth";
import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";

const StyledListCard = styled(Card)({
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

const StyledSidePanel = styled(Drawer)({
  "& .MuiDrawer-paper": {
    width: "100%",
    maxWidth: "600px",
  },
});

const CloseButton = styled(Button)({
  position: "absolute",
  top: "10px",
  right: "10px",
});

const MesListes = () => {
  const [shoppingList, setShoppingList] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [existingListNames, setExistingListNames] = useState([]);
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const listRef = ref(db, "users/" + userId + "/shoppingLists");

    onValue(listRef, (snapshot) => {
      const data = snapshot.val();
      setShoppingList(data);
      if (data) {
        const names = Object.keys(data);
        setExistingListNames(names);
      } else {
        setExistingListNames([]);
      }
    });
  }, [auth, db]);

  const handleDeleteList = (listId) => {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const listRef = ref(db, "users/" + userId + "/shoppingLists/" + listId);
    remove(listRef);
    // Fermer le side panel après la suppression de la liste
    setSidePanelOpen(false);
  };

  const handleRenameList = (listId) => {
    // Afficher le dialogue de renommage
    setRenameDialogOpen(true);
    // Mettre à jour l'ID de la liste sélectionnée dans l'état
    setSelectedListId(listId);
  };

  const handleCloseRenameDialog = () => {
    setRenameDialogOpen(false);
    setNewListName("");
  };

  const handleRenameConfirm = () => {
    const user = auth.currentUser;
    if (!user || !selectedListId) return;

    const userId = user.uid;

    // Récupérer le nom actuel de la liste
    const currentListName = shoppingList[selectedListId]?.name;
    console.log("currentListName : ", currentListName);

    // Vérifier si le nouveau nom est déjà utilisé
    if (
      existingListNames.includes(newListName) &&
      newListName !== currentListName
    ) {
      alert("Ce nom de liste est déjà utilisé. Veuillez en choisir un autre.");
      return;
    }

    // Créer un objet contenant les données de mise à jour
    const newData = {};
    newData[newListName] = shoppingList[selectedListId];

    // Supprimer l'ancienne liste avec l'ID comme clé et ajouter la nouvelle avec le nom comme clé
    const updates = {
      [`users/${userId}/shoppingLists/${selectedListId}`]: null,
      [`users/${userId}/shoppingLists/${newListName}`]: newData[newListName],
    };

    // Mettre à jour les données dans la base de données Firebase
    update(ref(db), updates)
      .then(() => {
        // Mettre à jour le nom dans la liste locale
        setShoppingList((prevShoppingList) => ({
          ...prevShoppingList,
          [newListName]: {
            ...prevShoppingList[selectedListId],
            name: newListName,
          },
          // Retirer l'ancienne liste de la liste locale
          ...(delete prevShoppingList[selectedListId] && prevShoppingList),
        }));
        // Fermer le dialogue de renommage après la mise à jour réussie
        handleCloseRenameDialog();
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la mise à jour du nom de la liste:",
          error
        );
      });
  };

  const handleOpenSidePanel = (listId) => {
    setSelectedList(shoppingList[listId]);
    setSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setSidePanelOpen(false);
  };

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Mes Listes de Courses
        </Typography>
        <div style={{ width: "100%" }}>
          {shoppingList ? (
            Object.keys(shoppingList).map((listId) => (
              <StyledListCard
                key={listId}
                onClick={() => handleOpenSidePanel(listId)}
              >
                <Typography variant="h6">{listId}</Typography>
                <div>
                  <Button onClick={() => handleDeleteList(listId)}>
                    Effacer
                  </Button>
                  <Button onClick={() => handleRenameList(listId)}>
                    Renommer
                  </Button>
                </div>
              </StyledListCard>
            ))
          ) : (
            <p>Chargement...</p>
          )}
        </div>
        <StyledSidePanel
          anchor="right"
          open={sidePanelOpen}
          onClose={handleCloseSidePanel}
        >
          <div>
            <CloseButton onClick={handleCloseSidePanel}>
              <Close />
            </CloseButton>
            {selectedList ? (
              <div>
                <Typography variant="h5" gutterBottom>
                  Contenu de la liste de courses :
                </Typography>
                {Object.entries(selectedList).map(([category, items]) => (
                  <div key={category}>
                    <Typography variant="subtitle1" gutterBottom>
                      {category}
                    </Typography>
                    <ul>
                      {items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <Typography variant="body1" gutterBottom>
                Cliquez sur l'appareil photo pour ajouter des articles à cette
                liste.
              </Typography>
            )}
          </div>
        </StyledSidePanel>

        <Dialog open={renameDialogOpen} onClose={handleCloseRenameDialog}>
          <DialogTitle>Renommer la liste de courses</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="newListName"
              label="Nouveau nom"
              type="text"
              fullWidth
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRenameDialog}>Annuler</Button>
            <Button onClick={handleRenameConfirm}>Confirmer</Button>
          </DialogActions>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MesListes;
