import { Box, Drawer } from "@mui/material";
import React, { useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Menu from "./Menu";

const Layout = ({ children = null }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleOpenCamera = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = true; // Ouvre directement l'appareil photo sur les appareils mobiles
    input.onchange = (e) => {
      const file = e.target.files[0];
      // Faites quelque chose avec le fichier choisi ou pris en photo, par exemple l'afficher ou l'envoyer à un serveur
      console.log(file);
    };
    input.click();
  };

  return (
    <>
      <Header onMenuClick={toggleMenu} />
      <Drawer
        anchor="left"
        open={isMenuOpen}
        onClose={toggleMenu}
        sx={{
          "& .MuiDrawer-paper": {
            width: "80%",
            bgcolor: "background.paper", // Ou toute autre couleur de votre choix
          },
        }}
      >
        <Menu />
        <Box
          sx={{ width: "80%" }}
          role="presentation"
          onClick={toggleMenu}
          onKeyDown={toggleMenu}
        >
          {/* Liens du menu ou composant de navigation */}
        </Box>
      </Drawer>
      <main>{children}</main>
      <Footer onCameraClick={handleOpenCamera} />
    </>
  );
};

export default Layout;
