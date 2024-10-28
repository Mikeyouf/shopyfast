import { useEffect } from "react";
import Layout from "../components/layout/Layout";
import Center from "../components/utils/Center";

const Recettes = (props) => {
  useEffect(() => {}, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      <Center>
        <h2>Mes recettes</h2>
      </Center>
    </Layout>
  );
};

export default Recettes;
