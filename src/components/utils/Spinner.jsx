// utils/Spinner.js
import React from "react";
import ClipLoader from "react-spinners/ClipLoader";
import Center from "./Center";

const Spinner = ({ loading }) => {
  if (!loading) return null;

  return (
    <Center>
      <div style={spinnerStyle}>
        <ClipLoader color="#000" loading={loading} size={50} />
        <p>Création de la liste...</p>
      </div>
    </Center>
  );
};

const spinnerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  zIndex: 1000,
};

export default Spinner;
