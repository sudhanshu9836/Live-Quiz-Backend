// Other imports...
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Quiz = require('./models/Quiz.js'); // Importing the Quiz model
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Change according to your client URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/live-Quiz-data", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Quiz Routes
const quizRoutes = require('./routes/quiz');
app.use('/api', quizRoutes);

// Score Routes
const scoreRoutes = require('./routes/score');
app.use('/api/scores', scoreRoutes);

// Admin Routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Array to store current questions
let questions = [];
let currentQuestionIndex = 0;
let quizStarted = false; // Added flag to track if quiz has started

// Fetch all questions on server startup
const loadQuestions = async () => {
  try {
    questions = await Quiz.find();
    console.log('Questions loaded:', questions.length);
  } catch (error) {
    console.error('Error loading questions:', error);
  }
};

loadQuestions(); // Load the questions initially

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('New client connected');

  // Notify the new client of the current quiz state if it has started
  socket.on('joinQuiz', () => {
    if (quizStarted) {
      socket.emit('newQuestion', questions[currentQuestionIndex]);
    }
  });

  socket.on('startQuiz', () => {
    if (!quizStarted) {
      quizStarted = true; // Set the quiz as started
      currentQuestionIndex = 0; // Reset index for new quiz session
      io.emit('startQuiz'); // Emit this event to notify clients that the quiz has started
      io.emit('newQuestion', questions[currentQuestionIndex]); // Send the first question to all clients
      console.log(currentQuestionIndex);
    }
  });

  // Listen for next question request from admin (only admin should trigger next question)
  socket.on('getNextQuestion', () => {
    if (quizStarted) {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex = currentQuestionIndex + 1; // Move to the next question
        console.log(currentQuestionIndex);
        io.emit('newQuestion', questions[currentQuestionIndex]); // Broadcast the new question to all clients
        // console.log('Next question sent:', questions[currentQuestionIndex]);
      } else {
        io.emit('quizOver'); // Emit quiz over event if it's the last question
        console.log('Quiz is over.');
      }
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});





