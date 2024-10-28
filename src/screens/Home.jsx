import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Grid } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import StyledButton from "../components/layout/StyleButton"; // Importez le composant
import Center from "../components/utils/Center";

const Home = (props) => {
  const navigate = useNavigate();

  useEffect(() => {}, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Layout>
      <Center>
        <Box sx={{ padding: "0 16px" }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={6} sm={3}>
              <StyledButton
                variant="outlined"
                fullWidth
                startIcon={<AssignmentIcon />}
                onClick={() => handleNavigation("/mes-listes")}
              >
                Listes
              </StyledButton>
            </Grid>
            <Grid item xs={6} sm={3}>
              <StyledButton
                variant="outlined"
                fullWidth
                startIcon={<RestaurantMenuIcon />}
                onClick={() => handleNavigation("/mes-recettes")}
              >
                Recettes
              </StyledButton>
            </Grid>
            <Grid item xs={6} sm={3}>
              <StyledButton
                variant="outlined"
                fullWidth
                startIcon={<AccountCircleIcon />}
                onClick={() => handleNavigation("/mon-profil")}
              >
                Profil
              </StyledButton>
            </Grid>
            <Grid item xs={6} sm={3}>
              <StyledButton
                variant="outlined"
                fullWidth
                startIcon={<SettingsIcon />}
                onClick={() => handleNavigation("/mes-preferences")}
              >
                Préférences
              </StyledButton>
            </Grid>
          </Grid>
        </Box>
      </Center>
    </Layout>
  );
};

export default Home;
