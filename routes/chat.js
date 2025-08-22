const express = require('express');
const router = express.Router();

// Route POST pour recevoir les messages du frontend
router.post('/', async (req, res) => {
  const { message, model } = req.body;

  if (!message || !model) {
    return res.status(400).json({ error: 'Message ou mod�le manquant.' });
  }

  try {
    // Envoie � l'IA � ici on simule une r�ponse simple
    // Tu peux connecter ici ta logique OpenAI/OpenRouter/Gemini
    const fakeResponse = `?? Tu as dit : "${message}", mod�le : ${model}`;
    res.json({ reply: fakeResponse });

  } catch (error) {
    console.error("Erreur IA :", error);
    res.status(500).json({ error: 'Erreur lors du traitement de la requ�te.' });
  }
});

module.exports = router;