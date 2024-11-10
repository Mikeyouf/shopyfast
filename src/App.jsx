import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AuthChecker from "./components/auth/AuthChecker";
import Center from "./components/utils/Center";
import { auth } from "./config/firebase";
import routes from "./config/routes";
import { ShoppingListProvider } from "./context/ShoppingListContext";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.info("User detected.");
      } else {
        console.info("No user detected");
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Center>
        <CircularProgress />
      </Center>
    );
  }

  return (
    <ShoppingListProvider>
      <Router>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                route.protected ? (
                  <AuthChecker>
                    <route.component />
                  </AuthChecker>
                ) : (
                  <route.component />
                )
              }
            />
          ))}
        </Routes>
      </Router>
    </ShoppingListProvider>
  );
}

export default App;
