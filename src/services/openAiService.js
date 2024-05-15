// src/services/openAiService.js
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const convertImageToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
});

export const analyzeImageWithGPT4Vision = async (imageUrl) => {
    const payload = {
        model: "gpt-4-vision-preview",
        messages: [{
            role: "user",
            content: [{
                    type: "text",
                    text: "Analyse cette image et extrait tout le texte que tu trouves. Il s'agit d'une liste de courses. Retourne les résultats sous forme de JSON structuré avec des catégories comme clés et les éléments comme valeurs de tableau. Exemple : {'fruits': ['Citron', 'Pomme'], 'produits_laitier': ['Lait', 'Fromage']}. Enlève les doublons et corrige les fautes d'orthographe si nécessaire."
                },
                {
                    type: "image_url",
                    image_url: {
                        url: imageUrl
                    }
                }
            ]
        }],
        max_tokens: 2500
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
            return parsedContent;
        } else {
            console.error('Invalid JSON content:', messageContent);
            throw new Error('Invalid JSON content in API response');
        }
    } catch (error) {
        console.error('Error calling OpenAI GPT-4 Vision API:', error);
        throw error;
    }
};