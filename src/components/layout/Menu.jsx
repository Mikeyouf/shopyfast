import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Pour "Mon profil"
import AssignmentIcon from "@mui/icons-material/Assignment"; // Pour "Mes listes"
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings"; // Pour "Mes préférences"
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom"; // Importez useNavigate
import Logout from "../auth/Logout";

const Menu = () => {
  const navigate = useNavigate(); // Utilisez useNavigate

  // Fonction pour gérer la navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      role="presentation"
    >
      <List>
        <ListItem button onClick={() => handleNavigation("/")}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Accueil" />
        </ListItem>
        {/* Naviguer vers Mes Listes */}
        <ListItem button onClick={() => handleNavigation("/mes-listes")}>
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Mes listes" />
        </ListItem>
        {/* Naviguer vers Mon Profil - Mettez à jour le chemin selon votre route */}
        <ListItem button onClick={() => handleNavigation("/mon-profil")}>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Mon profil" />
        </ListItem>
        {/* Naviguer vers Mes Préférences - Mettez à jour le chemin selon votre route */}
        <ListItem button onClick={() => handleNavigation("/mes-preferences")}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Mes préférences" />
        </ListItem>
      </List>
      <Box>
        <Divider />
        <List>
          <ListItem>
            <Logout />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default Menu;
