import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const EmailPasswordAuthModal = ({ open, handleClose }) => {
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between sign up and sign in
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      handleClose(); // Close modal on success
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {isSignUp ? 'S\'inscrire' : 'Se connecter'}
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Addresse e-mail"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {isSignUp ? 'S\'inscrire' : 'Se connecter'}
        </Button>
        <Button fullWidth variant="text" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Vous avez déjà un compte ? Se connecter' : "Vous n'avez pas de compte ? S'inscrire"}
        </Button>
      </Box>
    </Modal>
  );
};

export default EmailPasswordAuthModal;