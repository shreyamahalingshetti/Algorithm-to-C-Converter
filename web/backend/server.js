const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tokenize', require('./routes/tokenize'));
app.use('/api/parse', require('./routes/parse'));
app.use('/api/execute', require('./routes/execute'));
app.use('/api/generate', require('./routes/generate')); // For PDF/PNG if needed later

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
