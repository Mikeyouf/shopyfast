import { Button, Card, Drawer, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/system";

export const StyledDrawer = styled(Drawer)({
  "& .MuiDrawer-paper": {
    width: "100%",
    maxWidth: "600px",
    padding: "8px",
    "@media (max-width: 767px)": {
      width: "90vw", // Utilisez 100vw pour occuper toute la largeur de l'écran
      left: 0,
      right: 0,
    },
  },
});

export const CloseButton = styled(Button)({
  position: "absolute",
  top: "0",
  right: "0",
});

export const StyledCard = styled(Card)({
  marginBottom: "10px",
  padding: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  "&:hover": {
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
  },
  "&.completed": {
    textDecoration: "line-through",
  },
});

export const CategoryCard = styled(Card)({
  marginBottom: "20px",
  padding: "10px",
  backgroundColor: "#e0e0e0",
});

export const CustomIconButton = styled(IconButton)({
  padding: "4px",
});

export const CategoryTitle = styled(Typography)({
  fontWeight: "bold",
});
