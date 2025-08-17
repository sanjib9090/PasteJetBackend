const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// POST /execute endpoint to run code via Piston API
app.post('/execute', async (req, res) => {
  const { language, version, code, input } = req.body;

  // Validate request body
  if (!language || !version || !code) {
    return res.status(400).json({ error: 'Missing required fields: language, version, and code are required' });
  }

  try {
    const pistonRes = await axios.post(
      'https://emkc.org/api/v2/piston/execute',
      {
        language,
        version,
        files: [{ content: code }],
        stdin: input || '',
        compile_timeout: 10000, // 10 seconds
        run_timeout: 3000,     // 3 seconds
        compile_memory_limit: -1, // No limit
        run_memory_limit: -1     // No limit
      },
      {
        timeout: 15000 // 15-second timeout for Piston API request
      }
    );

    // Return only the run output (stdout, stderr, code, etc.)
    res.json(pistonRes.data.run);
  } catch (err) {
    console.error('Piston API error:', err.message);
    res.status(500).json({
      error: 'Execution failed',
      details: err.response?.data?.message || err.message
    });
  }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Listen on the port provided by Render (or 3000 locally)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = app;