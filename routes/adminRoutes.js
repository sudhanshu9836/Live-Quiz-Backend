const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const Score = require('../models/Score'); // Assuming you have a Score model

// Sample admin credentials (replace with database validation if needed)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123'; // Use bcrypt to store hashed passwords in a real application

// Admin login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Check if the provided credentials match the admin credentials
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Generate a token
    const token = jwt.sign({ username }, 'abcd', { expiresIn: '1h' });
    // Return the token to the client
    return res.json({ token });
  }

  // Invalid credentials
  console.log("Invalid")
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  // Extract token from the Authorization header
  const token = req.headers['authorization']?.split(' ')[1];
  // If no token, respond with an error
  if (!token) {
    return res.status(403).send('Token is required');
  }

  // Verify the token
  jwt.verify(token, 'abcd', (err, decoded) => {
    if (err) {
      // If token verification fails
      return res.status(401).send('Invalid token');
    }
    // Store decoded user info in request object
    req.user = decoded;
    next();
  });
};

// Route to download Excel with user scores (Admin only, protected by token)
router.get('/download-scores',verifyToken, async (req, res) => {
  try {
    // Fetch all scores from the database
    const scores = await Score.find();

    // Prepare data for Excel sheet
    const worksheetData = scores.map(score => ({
      Name: score.username,
      Score: score.score,
    }));

    // Create a new Excel workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(worksheetData);

    // Append worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Scores');

    // Convert workbook to a buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename="quiz_scores.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Send the buffer as the response
    res.send(buffer);
  } catch (error) {
    // Log the error and return an error response
    console.error('Error generating Excel:', error);
    res.status(500).json({ message: 'Error generating Excel sheet.' });
  }
});

module.exports = router;

