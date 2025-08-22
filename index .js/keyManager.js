// 🎛️ Gestion intelligente des clés API
const axios = require("axios");

const apiKeys = {
    openai: (process.env.OPENAI_API_KEYS || "").split(","),
    gemini: (process.env.GEMINI_API_KEYS || "").split(","),
    ai21: (process.env.AI21_API_KEYS || "").split(","),
    cohere: (process.env.COHERE_API_KEYS || "").split(","),
    openrouter: (process.env.OPENROUTER_API_KEYS || "").split(","),
};

let usedKeys = {};
let currentProvider = null;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function getValidKey() {
    if (currentProvider) return currentProvider;

    for (const [provider, keys] of Object.entries(apiKeys)) {
        usedKeys[provider] = usedKeys[provider] || [];

        for (const key of keys) {
            if (!key || usedKeys[provider].includes(key)) continue;

            try {
                if (provider === "openai") {
                    await axios.post(
                        "https://api.openai.com/v1/chat/completions",
                        {
                            model: "gpt-3.5-turbo",
                            messages: [{ role: "user", content: "ping" }],
                        },
                        {
                            headers: { Authorization: `Bearer ${key}` },
                            timeout: 5000,
                        }
                    );
                } else if (provider === "gemini") {
                    await axios.post(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`,
                        {
                            contents: [{ parts: [{ text: "ping" }] }],
                        },
                        { timeout: 5000 }
                    );
                } else if (provider === "ai21") {
                    await axios.post(
                        "https://api.ai21.com/studio/v1/j2-light/completion",
                        {
                            prompt: "ping",
                            numResults: 1,
                            maxTokens: 5,
                            temperature: 0.7,
                        },
                        {
                            headers: { Authorization: `Bearer ${key}` },
                            timeout: 5000,
                        }
                    );
                } else if (provider === "cohere") {
                    await axios.post(
                        "https://api.cohere.ai/v1/chat",
                        {
                            message: "ping",
                            model: "command-r",
                        },
                        {
                            headers: { Authorization: `Bearer ${key}` },
                            timeout: 5000,
                        }
                    );
                } else if (provider === "openrouter") {
                    await axios.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        {
                            model: "openai/gpt-3.5-turbo",
                            messages: [{ role: "user", content: "ping" }],
                        },
                        {
                            headers: { Authorization: `Bearer ${key}` },
                            timeout: 5000,
                        }
                    );
                }

                console.log(`✅ Clé valide : ${provider}`);
                currentProvider = { name: provider, key };
                return currentProvider;
            } catch (err) {
                const msg = err.message || "Erreur inconnue";
                if (msg.includes("ENOTFOUND") || msg.includes("timeout")) {
                    console.warn(`🌐 Erreur réseau ${provider}`);
                    await delay(1000);
                    continue;
                }
                console.warn(`❌ Clé refusée (${provider}) : ${msg}`);
                usedKeys[provider].push(key);
            }
        }
    }
    return null;
}

function scheduleKeyReset() {
    const reset = () => {
        usedKeys = {};
        currentProvider = null;
        console.log("♻️ Clés API réinitialisées.");
    };

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const delayMs = nextMidnight - now;

    setTimeout(() => {
        reset();
        setInterval(reset, 24 * 60 * 60 * 1000);
    }, delayMs);
}

module.exports = { getValidKey, scheduleKeyReset };
