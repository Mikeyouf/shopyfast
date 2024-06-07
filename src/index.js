import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FirebaseProvider } from "./config/firebaseContext";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

fetch("/static/js/main.[hash].js")
  .then((response) => response.text())
  .then((text) => {
    if (text.startsWith("<!DOCTYPE html>")) {
      console.error(
        "Received HTML instead of JavaScript. Check your paths and redirects."
      );
    } else {
      console.log("JavaScript file loaded successfully.");
    }
  })
  .catch((error) => console.error("Error fetching JavaScript file:", error));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <FirebaseProvider>
    <App />
  </FirebaseProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
serviceWorkerRegistration.register();
