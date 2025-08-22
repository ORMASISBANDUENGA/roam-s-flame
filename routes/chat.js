const express = require('express');
const router = express.Router();

// Route POST pour recevoir les messages du frontend
router.post('/', async (req, res) => {
  const { message, model } = req.body;

  if (!message || !model) {
    return res.status(400).json({ error: 'Message ou modèle manquant.' });
  }

  try {
    // Envoie à l'IA — ici on simule une réponse simple
    // Tu peux connecter ici ta logique OpenAI/OpenRouter/Gemini
    const fakeResponse = `?? Tu as dit : "${message}", modèle : ${model}`;
    res.json({ reply: fakeResponse });

  } catch (error) {
    console.error("Erreur IA :", error);
    res.status(500).json({ error: 'Erreur lors du traitement de la requête.' });
  }
});

module.exports = router;