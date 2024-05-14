import Layout from '../components/layout/Layout';
import Center from "../components/utils/Center";
import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";

const MesListes = () => {
    const [shoppingList, setShoppingList] = useState(null);
    const auth = getAuth();
    const db = getDatabase();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const userId = user.uid;
        console.log("userId : ", userId);
        const listRef = ref(db, 'shoppingLists/' + userId);
        console.log("listRef : ", listRef);

        // Récupérer une fois les données
        get(listRef).then((snapshot) => {
          // Snapshot contient les données du dossier "shoppingLists" pour l'utilisateur spécifié
          console.log("Données du dossier 'shoppingLists' pour l'utilisateur: ", snapshot.val());
        }).catch((error) => {
          console.error("Erreur lors de la récupération des données: ", error);
        });

        onValue(listRef, (snapshot) => {
            const data = snapshot.val();
            console.log("data : ", data)
            setShoppingList(data);
        });
    }, [auth, db]);

  return (
    <Layout>
      <Center>
      <h2>Mes Listes de Courses</h2>
            {shoppingList ? (
                <ul>
                    {Object.keys(shoppingList).map(category => (
                        <li key={category}>
                            <h2>{category}</h2>
                            <ul>
                                {shoppingList[category].map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Chargement...</p>
            )}
      </Center>
    </Layout>
  );
};

export default MesListes;