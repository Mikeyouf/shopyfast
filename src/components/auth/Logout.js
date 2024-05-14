import React, { useState } from "react";
import { Button } from "@mui/material";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";

const Logout = ({ navigateTo = "/login" }) => {
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const logout = () => {
    setDisabled(true);
    signOut(auth)
      .then(() => {
        navigate(navigateTo);
      })
      .catch((error) => {
        console.error(error);
        setDisabled(false);
      });
  };

  return (
    <Button
      disabled={disabled}
      onClick={logout}
      startIcon={<ExitToAppIcon />}
      color="inherit" // Assurez-vous que la couleur du texte est claire pour un meilleur contraste
    >
      Déconnexion
    </Button>
  );
};

export default Logout;
