import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase"; // Assurez-vous d'importer auth depuis votre configuration Firebase
import { Button, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import EmailIcon from '@mui/icons-material/Email';
import Center from "../utils/Center";
import EmailPasswordAuthModal from "./EmailPasswordAuthModal";
import { getDatabase, ref, set } from "firebase/database";

const AuthContainer = (props) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const signInWithGoogle = () => {
    setDisabled(true);

    // Créez une nouvelle instance du fournisseur Google et définissez les paramètres personnalisés
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    signInWithPopup(auth, provider)
      .then((result) => {
        const uid = result.user.uid;
        const db = getDatabase();
        console.log(result);
        // Vérifiez si l'utilisateur existe déjà dans la base de données ou créez une nouvelle entrée
        console.log('Setting user data in database', uid);
        set(ref(db, 'users/' + uid), {
          email: result.user.email,
          shoppingLists: {},
          // autres informations
        })
        // console.log("db : ", db)
        .then(() => console.log('User data set in database'))
        .catch(error => console.error('Error setting user data in database', error));

        setDisabled(false);
        navigate("/"); // Naviguez vers l'écran authentifié
      })
      .catch((error) => {
        setErrorMessage(error.code + ": " + error.message);
        setDisabled(false);
      });
  };    

  return (
    <Center height={"auto"}>
      <Button
        startIcon={<GoogleIcon />}
        size="large"
        disabled={disabled}
        variant="contained"
        onClick={signInWithGoogle}
        sx={{
          width: '100%',
          margin: '8px',
        }}
      >
        Google
      </Button>
      <Button
        startIcon={<EmailIcon />}
        size="large"
        variant="contained"
        onClick={() => setModalOpen(true)}
        disabled={disabled}
        sx={{
          backgroundColor: '#4CAF50',
          '&:hover': {
            backgroundColor: '#43A047', 
          },
          width: '100%', 
          margin: '8px',
        }}
      >
        Email
      </Button>
      <Typography sx={{ mt: 2 }} color={"red"}>
        {errorMessage}
      </Typography>
      <EmailPasswordAuthModal open={modalOpen} handleClose={() => setModalOpen(false)} />
    </Center>
  );
};

export default AuthContainer;
