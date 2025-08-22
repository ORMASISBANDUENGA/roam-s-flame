// fallbackConfig.js

module.exports = {
  defaultModel: "gpt-3.5-turbo", // Modèle par défaut à utiliser
  providers: {
    openai: {
      url: "https://api.openai.com/v1/chat/completions",
      models: ["gpt-3.5-turbo", "gpt-4"],
      keys: ["DEMO_KEY_OPENAI"], // Remplacez par vos clés API
    },
    openrouter: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      models: ["open-router-gpt-3.5", "open-router-gpt-4"],
      keys: ["DEMO_KEY_OPENROUTER"],
    },
    gemini: {
      url: "https://generativelanguage.googleapis.com/v1beta/models",
      models: ["gemini-small", "gemini-medium"],
      keys: ["DEMO_KEY_GEMINI"],
    },
    cohere: {
      url: "https://api.cohere.ai/v1/chat",
      models: ["cohere-chat", "cohere-generate"],
      keys: ["DEMO_KEY_COHERE"],
    },
    ai21: {
      url: "https://api.ai21.com/studio/v1",
      models: ["j1-jumbo", "j1-grande"],
      keys: ["DEMO_KEY_AI21"],
    },
  },
  fallbackResponse: "Désolé, je n'ai pas pu obtenir de réponse pour le moment.", // Réponse par défaut
};
