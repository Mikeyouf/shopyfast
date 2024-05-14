import { useEffect } from "react";
import Layout from '../components/layout/Layout';
import Center from "../components/utils/Center";

const MonProfil = (props) => {
  useEffect(() => {}, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      <Center>
        <h2>Mon profil</h2>
      </Center>
    </Layout>
  );
};

export default MonProfil;