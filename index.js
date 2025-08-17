const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/execute', async (req, res) => {
  const { language, version, code, input } = req.body;
  try {
    const pistonRes = await axios.post(
      'https://emkc.org/api/v2/piston/execute',
      {
        language,
        version,                    // e.g. "3.10.0" for Python
        files: [{ content: code }],
        stdin: input || ''
      }
    );
    res.json(pistonRes.data.run);   // { output, stderr, … }
  } catch (err) {
    res.status(500).json({ error: 'Execution failed', details: err.message });
  }
});

// Listen on the port provided by Render (or 3000 locally)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = app; // Optional, but good for modularity
