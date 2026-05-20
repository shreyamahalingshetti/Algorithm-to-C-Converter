const express = require('express');
const router = express.Router();
const Lexer = require('../lexer');
const Parser = require('../parser');
const CodeGenerator = require('../codegen');

router.post('/', (req, res) => {
  try {
    const { code, generateC } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    const lexer = new Lexer();
    const lexResult = lexer.tokenize(code);

    if (lexResult.errors.length > 0) {
      return res.status(400).json({ valid: false, errors: lexResult.errors });
    }

    const parser = new Parser(lexResult.tokens);
    const parseResult = parser.parse();

    if (generateC && parseResult.valid) {
        const codegen = new CodeGenerator(parseResult.tree, parseResult.variables, parseResult.symbolTable);
        const cCodeResult = codegen.generate();
        parseResult.cCode = cCodeResult.code;
    }

    res.json(parseResult);
  } catch (error) {
    res.status(500).json({ valid: false, errors: [{ message: error.message, line: 0, col: 0 }] });
  }
});

module.exports = router;
