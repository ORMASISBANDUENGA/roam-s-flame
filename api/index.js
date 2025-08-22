
const axios = require("axios");
const { getMemory } = require("../db/memory");
const { detectValidKey, currentProvider, resetProvider } = require("./keyManager");

async function sendSmartMessage(message) {
    let provider = currentProvider.provider || await detectValidKey();
    if (!provider) throw new Error("❌ Aucune clé valide disponible.");

    const { name, key } = provider;
    const memoryContext = await getMemory(10);

    const headers = { Authorization: `Bearer ${key}` };

    try {
        if (name === "openai") {
            const res = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Tu es Roam's.ai, assistant créé par Oromasis Banduenga, rapide, respectueux et utile." },
                    ...memoryContext,
                    { role: "user", content: message }
                ]
            }, { headers });
            return res.data.choices[0].message.content;
        }
        // Autres providers peuvent être ajoutés ici de manière similaire...
    } catch (err) {
        resetProvider();
        throw new Error("Erreur IA : " + err.message);
    }
}

module.exports = { sendSmartMessage };
