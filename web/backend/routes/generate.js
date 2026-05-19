const express = require('express');
const router = express.Router();

router.post('/report', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;
