import { Typography } from "@mui/material";
import { getAuth } from "firebase/auth";
import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import Layout from "../components/layout/Layout";
import RenameDialog from "../components/layout/RenameDialog";
import SidePanel from "../components/layout/SidePanel";
import StyledListCard from "../components/layout/StyledListCard";

const MesListes = () => {
  const [shoppingList, setShoppingList] = useState([]);
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
      if (data) {
        const lists = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        const orderedLists = lists.sort((a, b) => (a.order > b.order ? 1 : -1));
        setShoppingList(orderedLists);
        setExistingListNames(lists.map((list) => list.id));
      } else {
        setShoppingList([]);
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
    setSidePanelOpen(false);
  };

  const handleRenameList = (listId) => {
    setRenameDialogOpen(true);
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

    const currentListName = shoppingList.find(
      (list) => list.id === selectedListId
    )?.name;
    if (
      existingListNames.includes(newListName) &&
      newListName !== currentListName
    ) {
      alert("Ce nom de liste est déjà utilisé. Veuillez en choisir un autre.");
      return;
    }

    const updates = {
      [`users/${userId}/shoppingLists/${selectedListId}/name`]: newListName,
    };

    update(ref(db), updates)
      .then(() => {
        setShoppingList((prevShoppingList) =>
          prevShoppingList.map((list) =>
            list.id === selectedListId ? { ...list, name: newListName } : list
          )
        );
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
    setSelectedList(shoppingList.find((list) => list.id === listId));
    setSelectedListId(listId); // Ajoutez cette ligne
    setSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setSidePanelOpen(false);
  };

  const saveListOrder = (lists) => {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const updates = lists.reduce((acc, list, index) => {
      acc[`users/${userId}/shoppingLists/${list.id}/order`] = index;
      return acc;
    }, {});

    update(ref(db), updates).catch((error) => {
      console.error(
        "Erreur lors de la mise à jour de l'ordre des listes:",
        error
      );
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(shoppingList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setShoppingList(items);
    saveListOrder(items);
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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="shoppingLists">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {shoppingList.map((list, index) => (
                    <Draggable
                      key={list.id}
                      draggableId={list.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <StyledListCard
                            listId={list.id}
                            listName={list.name}
                            onOpenSidePanel={handleOpenSidePanel}
                            onDelete={handleDeleteList}
                            onRename={handleRenameList}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <SidePanel
          open={sidePanelOpen}
          onClose={handleCloseSidePanel}
          selectedList={selectedList}
          listId={selectedListId}
        />
        <RenameDialog
          open={renameDialogOpen}
          onClose={handleCloseRenameDialog}
          newListName={newListName}
          setNewListName={setNewListName}
          onRenameConfirm={handleRenameConfirm}
        />
      </div>
    </Layout>
  );
};

export default MesListes;
