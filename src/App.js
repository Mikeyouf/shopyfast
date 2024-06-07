import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthChecker from "./components/auth/AuthChecker";
import Center from "./components/utils/Center";
import { auth } from "./config/firebase";
import routes from "./config/routes";

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

  const basename = process.env.REACT_APP_ENV === "github" ? "/shopyfast" : "";

  return (
    <div>
      <BrowserRouter basename={basename}>
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
      </BrowserRouter>
    </div>
  );
}

export default App;
