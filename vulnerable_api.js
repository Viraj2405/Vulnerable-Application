const express = require('express');
const app = express();
app.use(express.json());

// Inefficient Fibonacci implementation - vulnerable to DOS
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

app.get('/fibonacci', (req, res) => {
  const n = parseInt(req.query.n);
  
  if (isNaN(n)) {
    return res.status(400).json({ 
      error: 'Invalid input', 
      message: 'Please provide a valid number for parameter n' 
    });
  }
  
  if (n < 0) {
    return res.status(400).json({ 
      error: 'Invalid input', 
      message: 'Fibonacci sequence is only defined for non-negative integers' 
    });
  }
  
  try {
    const result = fibonacci(n);
    res.status(200).json({ 
      result: result,
      input: n,
      message: 'Successfully calculated Fibonacci number'
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to calculate Fibonacci number' 
    });
  }
});

// Vulnerable endpoint for processing large JSON payloads
app.post('/process-data', (req, res) => {
  try {
    // This will work fine with small payloads
    if (req.body.data && req.body.data.length < 10000) {
      return res.status(200).json({
        status: 'success',
        message: 'Data processed successfully',
        length: req.body.data.length
      });
    }
    
    // But will crash with large payloads due to inefficient processing
    const processed = req.body.data.map(item => {
      // Intentionally inefficient processing
      let result = '';
      for (let i = 0; i < item.length; i++) {
        for (let j = 0; j < item.length; j++) {
          result += item[i] + item[j];
        }
      }
      return result;
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Large data processed (server should crash)',
      length: processed.length
    });
  } catch (err) {
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to process data'
    });
  }
});

app.listen(3000, () => {
  console.log('Vulnerable API running on port 3000');
});