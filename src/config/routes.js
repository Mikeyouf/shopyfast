import Home from "../screens/Home";
import Login from "../screens/Login";
import MesListes from "../screens/MesListes";
import MonProfil from "../screens/MonProfil";
import MesPreferences from "../screens/MesPreferences";

const routes = [{
        path: "",
        component: Home,
        name: "Home Page",
        protected: true,
    },
    {
        path: "/login",
        component: Login,
        name: "Login Screen",
        protected: false,
    },
    {
        path: "/mes-listes",
        component: MesListes,
        name: "Mes listes Screen",
        protected: true,
    },
    {
        path: "/mon-profil",
        component: MonProfil,
        name: "Mon profil Screen",
        protected: true,
    },
    {
        path: "/mes-preferences",
        component: MesPreferences,
        name: "Mes préférences Screen",
        protected: true,
    },
];

export default routes;