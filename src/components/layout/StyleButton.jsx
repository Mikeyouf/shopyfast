import { Button } from "@mui/material";
import { styled } from "@mui/system";

const StyledButton = styled(Button)({
  height: "100px",
  borderColor: "#1976D2",
  color: "#1976D2",
  backgroundColor: "transparent",
  flexDirection: "column",
  "&:hover": {
    backgroundColor: "rgba(25, 118, 210, 0.1)", // Utilisez la couleur bleue avec une opacité pour l'effet de survol
  },
});

export default StyledButton;
