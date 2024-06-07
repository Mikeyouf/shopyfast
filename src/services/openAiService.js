const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Définition des modèles de liste de courses basés sur le PDF
const shoppingListModels = {
    rayon_frais: ['Œufs', 'Jambon', 'Lardons', 'Charcuterie', 'Surimi', 'Pâtes fraîches', 'Ravioli', 'Gnocchi'],
    viande_poisson: ['Bœuf', 'Porc', 'Poulet', 'Saucisses', 'Poisson'],
    fruits: ['Pommes', 'Bananes', 'Oranges', 'Clémentines', 'Mandarines', 'Poires', 'Raisin', 'Kiwi', 'Pastèque', 'Melon', 'Fruits séchés', 'Noix', 'Noisettes'],
    legumes: ['Carottes', 'Tomates', 'Salade', 'Pommes de terre', 'Courgettes', 'Chou', 'Céleri', 'Brocoli', 'Oignons', 'Ail'],
    cremerie: ['Beurre', 'Yaourts', 'Fromage râpé', 'Mozzarella', 'Crème fraîche'],
    petit_dej: ['Céréales', 'Gâteaux', 'Brioche', 'Chocolat', 'Café', 'Thé', 'Cacao', 'Sucre', 'Confiture', 'Pâte à tartiner'],
    epicerie: ['Riz', 'Pâtes', 'Lentilles', 'Purée', 'Haricots', 'Semoule', 'Farine', 'Sel', 'Poivre', 'Bouillon', 'Fines herbes', 'Moutarde', 'Mayonnaise', 'Ketchup', 'Sauce tomate', 'Huile', 'Vinaigre', 'Pain de mie', 'Soupe', 'Olives', 'Biscuits apéritifs'],
    surgeles: ['Steaks hachés', 'Viande hachée', 'Poisson pané', 'Pizza', 'Frites', 'Légumes', 'Plats cuisinés', 'Glaces'],
    conserves: ['Plats cuisinés', 'Pâté', 'Maïs', 'Thon', 'Maquereaux', 'Sardines', 'Légumes', 'Fruits', 'Petits pots bébé'],
    boissons: ['Sodas', 'Eau', 'Eau gazeuse', 'Lait', 'Jus de fruits', 'Sirop', 'Bière', 'Vin', 'Apéritifs'],
    maison: ['Piles', 'Stylos', 'Encre imprimante', 'Scotch', 'Enveloppes', 'Papier'],
    hygiene_beaute: ['Savon', 'Gel douche', 'Shampooing', 'Après-shampooing', 'Dentifrice', 'Brosses à dents', 'Crème visage', 'Crème corps', 'Crème mains', 'Stick lèvres', 'Produit lentilles', 'Cire épilation', 'Rasoirs', 'Mousse à raser', 'Après-rasage', 'Déodorant', 'Savon mains', 'Gel cheveux', 'Laque', 'Serviettes', 'Tampons', 'Mouchoirs', 'Cotons', 'Cotons tiges', 'Couches', 'Pansements', 'Alcool'],
    animaux: ['Croquettes', 'Pâtée', 'Litière'],
    menage: ['Liquide vaisselle', 'Eponges', 'Lessive', 'Adoucissant', 'Papier aluminium', 'Papier sulfurisé', 'Film alimentaire', 'Vinaigre blanc', 'Bicarbonate', 'Produit WC', 'Produit sols', 'Javel', 'Essuie-tout', 'Papier toilette', 'Sacs poubelle']
};

export const getCategoryDisplayName = (categoryKey) => {
    const categoryNames = {
        rayon_frais: 'Rayon Frais',
        viande_poisson: 'Viande et Poisson',
        fruits: 'Fruits',
        legumes: 'Légumes',
        cremerie: 'Crèmerie',
        petit_dej: 'Petit Déjeuner',
        epicerie: 'Épicerie',
        surgeles: 'Surgelés',
        conserves: 'Conserves',
        boissons: 'Boissons',
        maison: 'Maison',
        hygiene_beaute: 'Hygiène et Beauté',
        animaux: 'Animaux',
        menage: 'Ménage'
    };

    return categoryNames[categoryKey] || categoryKey;
};

export const convertImageToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
});

export const analyzeImageWithGPT4Vision = async (imageUrl) => {
    const examples = Object.entries(shoppingListModels).map(([category, items]) => {
        return `${category}: ${items.join(', ')}`;
    }).join('\n');

    const prompt = `Analyse cette image et extraits-en tout le texte que tu trouves. Il s'agit d'une liste de courses. Retourne les résultats sous forme de JSON structuré avec des catégories comme clés et les éléments comme valeurs de tableau. Exemple : {'fruits': ['Citron', 'Pomme'], 'produits_laitiers': ['Lait', 'Fromage']}. Enlève les doublons, corrige les fautes d'orthographe si nécessaire et assure-toi que chaque élément est dans la catégorie appropriée.\n\nVoici quelques exemples de catégories et d'éléments:\n${examples}`;

    const payload = {
        model: "gpt-4o",
        messages: [{
            role: "user",
            content: [{
                    type: "text",
                    text: prompt
                },
                {
                    type: "image_url",
                    image_url: {
                        url: imageUrl
                    }
                }
            ]
        }],
        max_tokens: 1500 // Ajustez ce paramètre pour contrôler le coût
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to analyze image with OpenAI GPT-4 Vision');
        }

        const result = await response.json();
        console.log('Raw API Response:', result);

        const messageContent = result.choices[0].message.content;

        // Utiliser une regex pour extraire le bloc JSON
        const jsonMatch = messageContent.match(/```json\n([\s\S]*?)\n```/);

        if (jsonMatch && jsonMatch[1]) {
            const parsedContent = JSON.parse(jsonMatch[1]);
            console.log('Parsed Content:', parsedContent); // Log pour inspecter les données
            return parsedContent; // Pas besoin de classifierItems ici
        } else {
            console.error('Invalid JSON content:', messageContent);
            throw new Error('Invalid JSON content in API response');
        }
    } catch (error) {
        console.error('Error calling OpenAI GPT-4o API:', error);
        throw error;
    }
};