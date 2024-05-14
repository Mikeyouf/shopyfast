import {
    initializeApp
} from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider
} from "firebase/auth";
import {
    getDatabase
} from "firebase/database";
import {
    getStorage
} from "firebase/storage"; // Importez getStorage

import {
    firebaseConfig
} from "./firebase.config";

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const storage = getStorage(app); // Initialisez Storage avec votre app Firebase
export const auth = getAuth(app); // Assurez-vous de passer `app` à getAuth pour une initialisation correcte
export const Providers = {
    google: new GoogleAuthProvider()
};