
const axios = require("axios");

const apiKeys = {
    openai: (process.env.OPENAI_API_KEYS || "").split(","),
    gemini: (process.env.GEMINI_API_KEYS || "").split(","),
    ai21: (process.env.AI21_API_KEYS || "").split(","),
    cohere: (process.env.COHERE_API_KEYS || "").split(","),
    openrouter: (process.env.OPENROUTER_API_KEYS || "").split(","),
};

let usedKeys = {};
let currentProvider = { provider: null };

async function detectValidKey() {
    for (const [provider, keys] of Object.entries(apiKeys)) {
        usedKeys[provider] = usedKeys[provider] || [];
        for (const key of keys) {
            if (!key || usedKeys[provider].includes(key)) continue;
            try {
                if (provider === "openai") {
                    await axios.post("https://api.openai.com/v1/chat/completions", {
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "user", content: "Bonjour" }]
                    }, { headers: { Authorization: `Bearer ${key}` } });
                }
                currentProvider.provider = { name: provider, key };
                return currentProvider.provider;
            } catch {
                usedKeys[provider].push(key);
            }
        }
    }
    return null;
}

function scheduleKeyReset() {
    const reset = () => {
        usedKeys = {};
        currentProvider = { provider: null };
        console.log("♻️ Clés réinitialisées.");
    };
    const now = new Date();
    const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    setTimeout(() => {
        reset();
        setInterval(reset, 24 * 60 * 60 * 1000);
    }, millisTillMidnight);
}

function resetProvider() {
    currentProvider = { provider: null };
}

module.exports = { detectValidKey, scheduleKeyReset, currentProvider, resetProvider };
