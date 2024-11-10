import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Typography,
} from "@mui/material";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { auth, storage } from "../../config/firebase";
import { useShoppingList } from "../../context/ShoppingListContext";
import {
  getShoppingListsFromFirebase,
  saveShoppingListToFirebase,
} from "../../services/firebaseService";
import { analyzeImageWithGPT4Vision } from "../../services/openAiService";
import { checkCameraPermissions } from "../../serviceWorkerRegistration";
import Spinner from "../utils/Spinner";

const Footer = () => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { shoppingLists, setShoppingLists } = useShoppingList();
  const [selectedList, setSelectedList] = useState("");

  const fetchShoppingLists = useCallback(async () => {
    try {
      const lists = await getShoppingListsFromFirebase();
      console.log("Listes récupérées :", lists);
      setShoppingLists([...lists]);
    } catch (error) {
      console.error("Erreur lors de la récupération des listes :", error);
    }
  }, [setShoppingLists]);

  useEffect(() => {
    checkCameraPermissions();
    fetchShoppingLists();
  }, [fetchShoppingLists]);

  useEffect(() => {
    console.log("Changement d'état de openModal : ", openModal);
  }, [openModal]);

  const handleCameraIconClick = () => {
    fileInputRef.current.click();
  };

  const handleTouchStart = () => {
    fileInputRef.current.click();
  };

  async function uploadImageAndGetURL(file) {
    if (!auth.currentUser) {
      console.error("Aucun utilisateur connecté");
      return;
    }
    const uid = auth.currentUser.uid;
    const storageRef = ref(storage, `images/${uid}/${file.name}`);
    console.log("storageRef : ", storageRef);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    console.log("Image URL obtenue :", url);
    return url;
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const url = await uploadImageAndGetURL(file);
      setImageUrl(url);

      const result = await analyzeImageWithGPT4Vision(url);
      setAnalysisResult(result);
      console.log("Résultat de l'analyse :", result);

      setOpenModal(true);
      console.log("Modal ouvert : ", openModal);
    } catch (error) {
      console.error("Erreur lors du traitement de l'image :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewList = async () => {
    if (analysisResult) {
      console.log(
        "Création d'une nouvelle liste avec les résultats :",
        analysisResult
      );
      await saveShoppingListToFirebase(analysisResult);
      setShoppingLists((prevLists) => [...prevLists, analysisResult]);
    }
    // setOpenModal(false);
  };

  const handleUpdateExistingList = () => {
    if (!selectedList || !analysisResult) {
      console.error("Liste sélectionnée ou résultat d'analyse manquant");
      return;
    }

    // Récupérer l'objet complet de la liste à partir de `shoppingLists`
    const listToUpdate = shoppingLists.find((list) => list.id === selectedList);

    if (!listToUpdate) {
      console.error("Impossible de trouver la liste sélectionnée.");
      return;
    }

    // Créer un ensemble pour les éléments existants dans la liste sélectionnée
    const existingItemsSet = new Set();

    Object.keys(listToUpdate).forEach((category) => {
      if (Array.isArray(listToUpdate[category])) {
        listToUpdate[category].forEach((item) => {
          existingItemsSet.add(item);
        });
      }
    });

    // Parcourir chaque catégorie de `analysisResult`
    Object.keys(analysisResult).forEach((category) => {
      if (Array.isArray(analysisResult[category])) {
        if (listToUpdate[category]) {
          analysisResult[category].forEach((item) => {
            if (!existingItemsSet.has(item)) {
              listToUpdate[category].push(item);
              existingItemsSet.add(item);
            }
          });
        } else {
          listToUpdate[category] = analysisResult[category].filter(
            (item) => !existingItemsSet.has(item)
          );
          listToUpdate[category].forEach((item) => existingItemsSet.add(item));
        }
      }
    });

    console.log("Liste mise à jour sans doublons :", listToUpdate);

    // Sauvegarder la liste mise à jour dans Firebase
    saveShoppingListToFirebase(listToUpdate).then(() => {
      fetchShoppingLists(); // Mettre à jour les listes après la mise à jour
    });
    setOpenModal(false);
  };

  return (
    <>
      {loading && <Spinner loading={loading} />}
      <input
        type="file"
        accept="image/*"
        capture="camera"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Box
        sx={{
          width: "100%",
          position: "fixed",
          bottom: 0,
          textAlign: "center",
          pb: 2,
        }}
      >
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="label"
          onClick={handleCameraIconClick}
          onTouchStart={handleTouchStart}
          sx={{ cursor: "pointer" }}
        >
          <PhotoCameraIcon />
        </IconButton>
      </Box>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            p: 4,
            backgroundColor: "white",
            borderRadius: 2,
            margin: "auto",
            mt: 10,
            maxWidth: 400,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            Que souhaitez-vous faire ?
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Voulez-vous créer une nouvelle liste ou compléter une liste
            existante ?
          </Typography>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Uploaded"
              style={{ width: "100%", marginTop: "16px" }}
            />
          )}
          <Button
            onClick={handleCreateNewList}
            sx={{ mt: 2, mr: 1 }}
            variant="contained"
            color="primary"
          >
            Créer une nouvelle liste
          </Button>
          <Select
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            displayEmpty
            sx={{ mt: 2, width: "100%" }}
            inputProps={{ "aria-label": "Select a shopping list" }}
          >
            <MenuItem value="" disabled>
              Sélectionnez une liste
            </MenuItem>
            {shoppingLists.map((list) => (
              <MenuItem key={list.id} value={list.id}>
                {list.name}
              </MenuItem>
            ))}
          </Select>
          <Button
            onClick={handleUpdateExistingList}
            sx={{ mt: 2 }}
            variant="outlined"
            color="secondary"
            disabled={!selectedList}
          >
            Compléter la liste sélectionnée
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default Footer;
