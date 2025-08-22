// 🔍 Module principal d'interaction avec les IA
const { getMemory } = require("../db/memory");
const { getValidKey } = require("./keyManager");
const axios = require("axios");

async function sendSmartMessage(message) {
    const memoryContext = await getMemory();
    const provider = await getValidKey();
    if (!provider) throw new Error("❌ Aucune clé valide disponible.");
    const { name, key } = provider;

    const baseContext = [
        {
            role: "system",
            content:
                "Tu es MASIS, l'assistant personnel intelligent, rapide et fiable. Tu as été créé par Oromasis Bakalayeto Banduenga, étudiant de l'université Joseph Kasa-Vubu. Sois toujours courtois, pertinent, et bienveillant.",
        },
        ...memoryContext,
        { role: "user", content: message },
    ];

    if (name === "openai") {
        const res = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            { model: "gpt-3.5-turbo", messages: baseContext },
            { headers: { Authorization: `Bearer ${key}` } }
        );
        return res.data.choices[0].message.content;
    }

    if (name === "gemini") {
        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`,
            { contents: [{ parts: [{ text: message }] }] }
        );
        return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Réponse vide.";
    }

    if (name === "ai21") {
        const res = await axios.post(
            "https://api.ai21.com/studio/v1/j2-light/completion",
            {
                prompt: message,
                numResults: 1,
                maxTokens: 100,
                temperature: 0.7,
            },
            { headers: { Authorization: `Bearer ${key}` } }
        );
        return res.data.completions?.[0]?.data?.text || "❌ Réponse vide.";
    }

    if (name === "cohere") {
        const res = await axios.post(
            "https://api.cohere.ai/v1/chat",
            { message, model: "command-r" },
            { headers: { Authorization: `Bearer ${key}` } }
        );
        return res.data.text || "❌ Réponse vide.";
    }

    if (name === "openrouter") {
        const res = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-3.5-turbo",
                messages: baseContext,
            },
            { headers: { Authorization: `Bearer ${key}` } }
        );
        return res.data.choices?.[0]?.message?.content || "❌ Réponse vide.";
    }

    throw new Error("❌ Fournisseur non pris en charge.");
}

module.exports = { sendSmartMessage };
