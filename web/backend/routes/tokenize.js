const express = require('express');
const router = express.Router();
const Lexer = require('../lexer');

router.post('/', (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    const lexer = new Lexer();
    const result = lexer.tokenize(code);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
