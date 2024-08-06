const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const rooms = {};
const questions = [
  { question: 'Вопрос 1', answers: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'], correct: 0 },
  { question: 'Вопрос 2', answers: ['Ответ A', 'Ответ B', 'Ответ C', 'Ответ D'], correct: 2 }
];

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on('create-room', () => {
    const roomId = Math.random().toString(36).substr(2, 5);
    rooms[roomId] = { players: [], creator: socket.id, currentQuestion: 0, answers: {} };
    socket.join(roomId);
    socket.emit('room-created', roomId);
    console.log(`Room ${roomId} created`);
  });

  socket.on('join-room', (roomId, nickname) => {
    if (rooms[roomId]) {
      const imageIndex = rooms[roomId].players.length % 5;
      const user = { id: socket.id, nickname, ready: false, image: `file${imageIndex + 1}.png`, score: 0 };
      rooms[roomId].players.push(user);
      user.score = 0;
      socket.join(roomId);
      socket.emit('room-joined', roomId, rooms[roomId].players);
      io.to(roomId).emit('user-joined', rooms[roomId].players);
      console.log(`User ${nickname} joined room ${roomId}`);
    } else {
      socket.emit('error', 'Room not found');
      console.error(`Room ${roomId} not found for user ${nickname}`);
    }
  });

  socket.on('player-ready', (roomId, nickname) => {
    const room = rooms[roomId];
    if (room) {
      const player = room.players.find(p => p.nickname === nickname);
      if (player) {
        player.ready = true;
        io.to(roomId).emit('user-joined', room.players);
        console.log(`Player ${nickname} is ready in room ${roomId}`);
        if (room.players.every(p => p.ready)) {
          StartNextQuestion(roomId);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const userIndex = room.players.findIndex(user => user.id === socket.id);
      if (userIndex !== -1) {
        const [user] = room.players.splice(userIndex, 1);
        io.to(roomId).emit('user-left', room.players);
        console.log(`User ${user.nickname} left room ${roomId}`);
        if (room.players.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted`);
        }
        break;
      }
    }
  });

  socket.on('answer', (roomId, nickname, answerIndex) => {
    const room = rooms[roomId];
    if (room) {
      const player = room.players.find(p => p.nickname === nickname);
      if (player && !(nickname in room.answers)) {
        const currentQuestionIndex = room.currentQuestion-1;
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion.correct === answerIndex) {
          player.score += 50;
          console.log("Ответ верный, ваш ответ " + answerIndex);
          console.log("Верный ответ " + currentQuestion.correct);
        } else {
          console.log("Ответ не верный, ваш ответ " + answerIndex);
          console.log("Верный ответ " + currentQuestion.correct);
        }
        room.answers[nickname] = answerIndex;
  
        if (Object.keys(room.answers).length === room.players.length) {
          setTimeout(() => {
            StartNextQuestion(roomId);
          }, 3000);
        }
      }
    }
  });
});

function StartNextQuestion(roomId) {
  const room = rooms[roomId];
  if (room) {
    if (room.currentQuestion < questions.length) {
      io.to(roomId).emit('next-question', questions[room.currentQuestion]);
      room.currentQuestion++;
      room.answers = {};

      /*setTimeout(() => {
        updatePlayerPositions();
      }, 1000);
*/
      setTimeout(() => {
        StartNextQuestion(roomId);
      }, 40000);
    } else {
      io.to(roomId).emit('quiz-ended');
    }
  }
}

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});