import React, { useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { analyzeImageWithGPT4Vision } from '../../services/openAiService';
import { storage, auth } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { saveShoppingListToFirebase } from '../../services/firebaseService';

const Footer = () => {
  const fileInputRef = useRef(null);

  const handleCameraIconClick = () => {
    fileInputRef.current.click(); // Simule un clic sur l'input file
  };

  // Fonction pour télécharger une image et obtenir l'URL
  async function uploadImageAndGetURL(file) {
    if (!auth.currentUser) {
      console.error('Aucun utilisateur connecté');
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

    try {
      // Téléchargez l'image vers Firebase Storage et obtenez l'URL
      const imageUrl = await uploadImageAndGetURL(file);
      console.log('Image URL:', imageUrl);

      // Utilisez l'URL de l'image avec votre fonction pour analyser l'image
      const analysisResult = await analyzeImageWithGPT4Vision(imageUrl);
      console.log('Analysis Result:', analysisResult);

      // Enregistrez le résultat de l'analyse dans Firebase Realtime Database
      await saveShoppingListToFirebase(analysisResult);
      console.log('Analysis result saved to Firebase');
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Box sx={{ width: '100%', position: 'fixed', bottom: 0, textAlign: 'center', pb: 2 }}>
        <IconButton color="primary" aria-label="upload picture" component="span" onClick={handleCameraIconClick}>
          <PhotoCameraIcon />
        </IconButton>
      </Box>
    </>
  );
};

export default Footer;