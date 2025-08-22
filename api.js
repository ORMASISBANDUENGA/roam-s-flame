// backend/api.js
const fetch = require("node-fetch");

async function sendSmartMessage(message, provider, key) {
  if (!message || !provider || !key) throw new Error("Paramètres manquants");

  let url, headers, body;

  switch (provider.toLowerCase()) {
    case "openai":
      url = "https://api.openai.com/v1/chat/completions";
      headers = { "Content-Type": "application/json", "Authorization": `Bearer ${key}` };
      body = JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: message }] });
      break;

    case "openrouter":
      url = "https://openrouter.ai/api/v1/chat/completions";
      headers = { "Content-Type": "application/json", "Authorization": `Bearer ${key}` };
      body = JSON.stringify({ model: "openai/gpt-3.5-turbo", messages: [{ role: "user", content: message }] });
      break;

    case "gemini":
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`;
      headers = { "Content-Type": "application/json" };
      body = JSON.stringify({ contents: [{ role: "user", parts: [{ text: message }] }] });
      break;

    case "cohere":
      url = "https://api.cohere.ai/generate";
      headers = { "Content-Type": "application/json", "Authorization": `Bearer ${key}` };
      body = JSON.stringify({ model: "xlarge", prompt: message, max_tokens: 200 });
      break;

    case "ai21":
      url = "https://api.ai21.com/studio/v1/j2-mid/complete";
      headers = { "Content-Type": "application/json", "Authorization": `Bearer ${key}` };
      body = JSON.stringify({ prompt: message, maxTokens: 200 });
      break;

    default:
      throw new Error("Provider non supporté: " + provider);
  }

  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur API ${provider}: ${res.status} ${text}`);
  }

  const data = await res.json();

  if (provider.toLowerCase() === "gemini") return data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Pas de réponse Gemini";
  if (provider.toLowerCase() === "cohere") return data?.generations?.[0]?.text || "❌ Pas de réponse Cohere";
  if (provider.toLowerCase() === "ai21") return data?.completions?.[0]?.data?.text || "❌ Pas de réponse AI21";

  return data?.choices?.[0]?.message?.content || "❌ Pas de réponse";
}

module.exports = { sendSmartMessage };