exports.getChatResponse = (req, res) => {
  const message = req.body.message;
  res.json({ reply: `Tu as dit : ${message}` });
};