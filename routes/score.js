const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// Save user scores
router.post('/save', async (req, res) => {
  const scores = req.body; // This will be an array of { username, score }
  console.log('Received scores:', scores); // Debugging step

  try {
    // Insert all scores directly into the database
    const saveScores = await Score.insertMany(scores.map(({ username, score }) => ({ username, score })));
    console.log(saveScores);
    res.status(201).json({ message: 'All scores saved successfully!', savedScores: saveScores });
  } catch (error) {
    res.status(500).json({ message: 'Error saving scores', error });
  }
});

module.exports = router;



