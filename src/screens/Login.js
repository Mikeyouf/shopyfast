import { Box, Tab, Tabs } from "@mui/material";
import React from "react";
import { useSearchParams } from "react-router-dom";
import AuthContainer from "../components/auth/AuthContainer";
import Center from "../components/utils/Center";
import logo from '../images/logo-shopyfast.webp'; 

const tabIdToURL = {
  0: "login",
  1: "register",
};

const Login = (props) => {
  // getting and setting URL params
  const [searchParams, setSearchParams] = useSearchParams();

  // get action from URL
  const action = searchParams.get("action") || "login";

  // used to set initial state
  let indexFromUrl = 0;
  if (action === "register") {
    indexFromUrl = 1;
  }

  // handle Tab Panel
  const [value, setValue] = React.useState(indexFromUrl);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const action = tabIdToURL[newValue];
    setSearchParams({ action });
  };

  return (
    <Center height={90}>
      <Box
        component="img"
        sx={{
          height: 160,
          width: 160,
          marginBottom: 2,
        }}
        alt="Logo ShopyFast"
        src={logo}
      />
      <Box
        display={"flex"}
        alignItems={"center"}
        flexDirection={"column"}
        boxShadow={2}
        margin={3}
        sx={{
          minWidth: 300,
        }}
      >
        <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Tabs
            orientation="vertical" // Configure les Tabs pour être verticales
            variant="scrollable" // Permet aux Tabs de défiler si nécessaire
            value={value}
            onChange={handleChange}
            sx={{ borderRight: 1, borderColor: 'divider', '.MuiTabs-flexContainer': { flexDirection: 'column' } }} // Applique la flexDirection column au conteneur des tabs
          >
            <Tab sx={{
              px: { xs: 3, sm: 4 }, // padding horizontal qui augmente avec la taille de l'écran
              py: { xs: 3, sm: 4 }, // padding vertical qui augmente avec la taille de l'écran
            }}
            label="Se connecter" />
            <Tab sx={{
              px: { xs: 3, sm: 4 }, // padding horizontal qui augmente avec la taille de l'écran
              py: { xs: 3, sm: 4 }, // padding vertical qui augmente avec la taille de l'écran
            }} 
            label="S'enregistrer" />
          </Tabs>
        </Box>
        {/* login */}
        <TabPanel value={value} index={0}>
          <AuthContainer />
        </TabPanel>
        {/* register */}
        <TabPanel value={value} index={1}>
          <AuthContainer />
        </TabPanel>
      </Box>
    </Center>
  );
};

const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <>{children}</>
        </Box>
      )}
    </div>
  );
};

export default Login;
