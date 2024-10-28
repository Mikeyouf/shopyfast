import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Box, IconButton } from "@mui/material";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import { auth, storage } from "../../config/firebase";
import { saveShoppingListToFirebase } from "../../services/firebaseService";
import { analyzeImageWithGPT4Vision } from "../../services/openAiService";
import { checkCameraPermissions } from "../../serviceWorkerRegistration";
import Spinner from "../utils/Spinner";

const Footer = () => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false); // État de chargement

  useEffect(() => {
    // Vérifier les permissions caméra lorsque le composant est monté
    checkCameraPermissions();
  }, []);

  const handleCameraIconClick = () => {
    fileInputRef.current.click(); // Simule un clic sur l'input file
  };

  const handleTouchStart = () => {
    fileInputRef.current.click(); // Simule un clic sur mobile (touch)
  };

  async function uploadImageAndGetURL(file) {
    if (!auth.currentUser) {
      console.error("Aucun utilisateur connecté");
      return;
    }
    const uid = auth.currentUser.uid; // Obtenez l'UID de l'utilisateur connecté
    const storageRef = ref(storage, `images/${uid}/${file.name}`); // Incluez l'UID dans le chemin
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true); // Démarrer le spinner
    try {
      const imageUrl = await uploadImageAndGetURL(file);
      console.log("Image URL:", imageUrl);

      const analysisResult = await analyzeImageWithGPT4Vision(imageUrl);
      console.log("Analysis Result:", analysisResult);

      await saveShoppingListToFirebase(analysisResult);
      console.log("Analysis result saved to Firebase");
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setLoading(false); // Arrêter le spinner
    }
  };

  return (
    <>
      {loading && <Spinner loading={loading} />} {/* Affichage du spinner */}
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
          component="label" // Composant utilisé comme label pour améliorer la compatibilité mobile
          onClick={handleCameraIconClick}
          onTouchStart={handleTouchStart} // Ajout de onTouchStart pour mobile
          sx={{ cursor: "pointer" }} // Assure que le curseur de la souris est correct
        >
          <PhotoCameraIcon />
        </IconButton>
      </Box>
    </>
  );
};

export default Footer;
