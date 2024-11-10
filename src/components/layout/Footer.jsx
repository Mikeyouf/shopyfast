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
  const [selectedList, setSelectedList] = useState(null);

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
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const url = await uploadImageAndGetURL(file);
      setImageUrl(url);
      console.log("Image URL:", url);

      const result = await analyzeImageWithGPT4Vision(url);
      setAnalysisResult(result);
      console.log("Analysis Result:", result);

      setOpenModal(true); // Ouvrir le modal après l'analyse
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewList = async () => {
    if (analysisResult) {
      await saveShoppingListToFirebase(analysisResult);
      console.log("Nouvelle liste créée avec succès !");
      setShoppingLists((prevLists) => [...prevLists, analysisResult]);
    }
    setOpenModal(false);
  };

  const handleUpdateExistingList = () => {
    if (!selectedList || !analysisResult) {
      console.error("Liste sélectionnée ou résultat d'analyse manquant");
      return;
    }

    // Créer un ensemble pour les éléments existants dans la liste sélectionnée
    const existingItemsSet = new Set();

    // Ajouter tous les éléments existants de la liste sélectionnée à l'ensemble
    Object.keys(selectedList).forEach((category) => {
      if (Array.isArray(selectedList[category])) {
        selectedList[category].forEach((item) => {
          existingItemsSet.add(item);
        });
      }
    });

    // Parcourir chaque catégorie de la nouvelle liste
    Object.keys(analysisResult).forEach((category) => {
      if (Array.isArray(analysisResult[category])) {
        // Si la catégorie existe déjà dans la liste sélectionnée, ajoutez les nouveaux éléments
        if (selectedList[category]) {
          analysisResult[category].forEach((item) => {
            if (!existingItemsSet.has(item)) {
              selectedList[category].push(item);
              existingItemsSet.add(item); // Ajouter l'élément à l'ensemble
            }
          });
        } else {
          // Sinon, ajoutez la catégorie entière
          selectedList[category] = analysisResult[category].filter(
            (item) => !existingItemsSet.has(item)
          );
          // Mettre à jour l'ensemble avec les nouveaux éléments
          selectedList[category].forEach((item) => existingItemsSet.add(item));
        }
      }
    });

    console.log("Liste mise à jour sans doublons :", selectedList);
    // Sauvegarder la liste mise à jour dans Firebase
    saveShoppingListToFirebase(selectedList).then(() => {
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
              <MenuItem key={list.id} value={list}>
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
