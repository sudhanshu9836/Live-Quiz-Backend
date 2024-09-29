// routes/score.js
const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const ExcelJS = require('exceljs');  // Importing ExcelJS for exporting data to Excel

// Save user score
router.post('/save', async (req, res) => {
  const { username, score} = req.body;
  if (!username || score === undefined) {
    return res.status(400).json({ message: 'Username and score are required' });
  }

  try {
    const newScore = new Score({ username, score });
    await newScore.save();
    res.status(200).json({ message: 'Score saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: could not save score' });
  }
});


module.exports = router;

