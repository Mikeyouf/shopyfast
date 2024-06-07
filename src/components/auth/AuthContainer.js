import EmailIcon from "@mui/icons-material/Email";
import GoogleIcon from "@mui/icons-material/Google";
import { Button, Typography } from "@mui/material";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { child, get, getDatabase, ref, set, update } from "firebase/database";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import Center from "../utils/Center";
import EmailPasswordAuthModal from "./EmailPasswordAuthModal";

const AuthContainer = (props) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const signInWithGoogle = () => {
    setDisabled(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    signInWithPopup(auth, provider)
      .then((result) => {
        const uid = result.user.uid;
        const db = getDatabase();
        const userRef = ref(db, "users/" + uid);

        get(child(ref(db), "users/" + uid))
          .then((snapshot) => {
            if (snapshot.exists()) {
              // L'utilisateur existe déjà, mettez à jour les informations nécessaires
              update(userRef, {
                email: result.user.email,
                // autres informations à mettre à jour
              })
                .then(() => console.log("User data updated in database"))
                .catch((error) =>
                  console.error("Error updating user data in database", error)
                );
            } else {
              // L'utilisateur n'existe pas, créez une nouvelle entrée
              set(userRef, {
                email: result.user.email,
                shoppingLists: {},
                // autres informations
              })
                .then(() => console.log("User data set in database"))
                .catch((error) =>
                  console.error("Error setting user data in database", error)
                );
            }
          })
          .catch((error) =>
            console.error("Error checking user data in database", error)
          );

        setDisabled(false);
        navigate("/");
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
        sx={{ width: "100%", margin: "8px" }}
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
          backgroundColor: "#4CAF50",
          "&:hover": { backgroundColor: "#43A047" },
          width: "100%",
          margin: "8px",
        }}
      >
        Email
      </Button>
      <Typography sx={{ mt: 2 }} color={"red"}>
        {errorMessage}
      </Typography>
      <EmailPasswordAuthModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
      />
    </Center>
  );
};

export default AuthContainer;
