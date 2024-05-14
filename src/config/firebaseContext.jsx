import React, { createContext, useContext } from 'react';
import { database, storage } from './firebase'; // Assurez-vous d'exporter `storage` depuis votre fichier de configuration Firebase

const FirebaseContext = createContext();

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider value={{ database, storage }}>
      {children}
    </FirebaseContext.Provider>
  );
};