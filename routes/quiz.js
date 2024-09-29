// routes/quiz.js
const express = require('express');
const Quiz = require('../models/Quiz');
const router = express.Router();

// Get all questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await Quiz.find();
    res.json(questions);
  } catch (error) {
    console.log('Error fetching questions:', error);  // This will help you debug
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
