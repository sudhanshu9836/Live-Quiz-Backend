// Other imports...
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Quiz = require('./models/Quiz.js'); // Importing the Quiz model
const Score = require('./models/Score.js'); 
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "https://live-quiz-eight.vercel.app",
  methods: ["GET", "POST"]
}));
const io = socketIo(server, {
  cors: {
    origin: "https://live-quiz-eight.vercel.app",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'] 
});

// Middleware

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
const userScores = {}; // Object to track scores of each user
let questionTimer;

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

const startQuestionTimer = () => {
  questionTimer = setTimeout(() => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      io.emit('newQuestion', questions[currentQuestionIndex]);
      startQuestionTimer(); // Restart the timer for the next question
    } else {
      io.emit('quizOver');
      clearTimeout(questionTimer);
      // After quiz is over, store all scores locally in userScores array
       const allScores = Object.keys(userScores).map(socketId => {
        return {
           username: userScores[socketId].username,
           score: userScores[socketId].score
       };
});

// Now 'allScores' will hold an array of all users' scores and their respective usernames
console.log("All user scores:", allScores); 
  }
  }, 30000); // Set to 30 seconds for each question
};

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('New client connected');

  // Notify the new client of the current quiz state if it has started
  socket.on('joinQuiz', (username) => {
    if (quizStarted) {
      socket.emit('newQuestion', questions[currentQuestionIndex]);
    }
     // Initialize user score
     userScores[socket.id] = { username: username, score: 0 }; // Initialize their score
  });

  // Admin start Quiz...
  socket.on('startQuiz', () => {
    if (!quizStarted) {
      quizStarted = true; // Set the quiz as started
      currentQuestionIndex = 0; // Reset index for new quiz session
      io.emit('startQuiz'); // Emit this event to notify clients that the quiz has started
      io.emit('newQuestion', questions[currentQuestionIndex]); // Send the first question to all clients
      console.log(currentQuestionIndex);
      startQuestionTimer(); // Start the question timer
    }
  });

   // Listen for user answers
   socket.on('answerQuestion', (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (answer === currentQuestion.correctAnswer) {
      // Update user's score
      userScores[socket.id].score += 1;
      console.log("new user score update")
      console.log(`Score updated for ${userScores[socket.id].username}: ${userScores[socket.id].score}`);
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





