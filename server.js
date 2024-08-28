const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const rooms = {};
let shuffledQuestions = [];
let selectedQuestions = [];
const questions = [
  { question: 'Во сколько лет Решетнев Михаил Федорович окончил школу?', answers: ['Правильный', 'Ответ 2', 'Ответ 3'], correct: 0 },
  { question: 'По какой причине приёмные комиссии авиационных вузов страны отказывали в поступлении Решетневу?', answers: ['Ответ A', 'Ответ B', 'Правильный', 'Ответ D'], correct: 2 },
  { question: 'В какой институт поступил Михаил Федорович?', answers: ['Ответ 1', 'Правильный', 'Ответ 3'], correct: 1 },
  { question: 'Что названо именем Решетнева Михаила Федоровича?', answers: ['Ответ A', 'Ответ B', 'Ответ C'], correct: 2 },
  { question: 'Первое место работы Решетнева?', answers: ['Ответ 1', 'Ответ 2', 'Правильный'], correct: 0 },
  { question: 'Какое название, в настоящее время, носит город, в котором находился филиал ОКБ, где Михаил Федорович был главным конструктором?', answers: ['Ответ A', 'Ответ B', 'Ответ C'], correct: 2 },
  { question: 'В какой город эвакуировали МАИ, где учился Михаил Федорович, в начале Великой отечественной войны?', answers: ['Ответ 1', 'Ответ 2', 'Ответ 3'], correct: 1 },
  { question: 'Учеником и соподвижником какого ученого был Решетнев?', answers: ['Ответ A', 'Правильный', 'Ответ C'], correct: 0 },
  { question: 'Макет какой ракеты, сконструированной Михаилом Федоровичем, стоит сегодня на площади Котельникова города Красноярска?', answers: ['Правильный', 'Ответ 2', 'Ответ 3'], correct: 1 },
  { question: 'Спутники какой системы являются «детищем» предприятия Решетнева?', answers: ['Ответ A', 'Ответ B', 'Правильный'], correct: 2 },
  { question: 'Какого роста должен был быть человек в СССР, чтобы попасть в отряд космонавтов?', answers: ['Правильный', 'Ответ 2', 'Ответ 3'], correct: 2 },
  { question: 'К какому типу звезд относится Солнце?', answers: ['Ответ A', 'Ответ B', 'Правильный'], correct: 1 },
  { question: 'Какой русский ученый является основоположником космонавтики?', answers: ['Ответ 1', 'Правильный', 'Ответ 3'], correct: 1 },
  { question: 'На какой из планет Солнечной системы находится самая высокая гора?', answers: ['Ответ A', 'Ответ B', 'Ответ C'], correct: 2 },
  { question: 'Какая звезда является самой близкой к Земле?', answers: ['Ответ 1', 'Ответ 2', 'Правильный'], correct: 0 },
  { question: 'Сколько планет в Солнечной системе?', answers: ['Ответ A', 'Ответ B', 'Ответ C'], correct: 1 },
  { question: 'Сколько часов длятся сутки на Юпитере?', answers: ['Ответ 1', 'Ответ 2', 'Ответ 3'], correct: 1 },
  { question: 'Сколько собак летало в космос в первый раз?', answers: ['Ответ A', 'Правильный', 'Ответ C'], correct: 0 },
  { question: 'Какие две планеты Солнечной системы не имеют естественных спутников?', answers: ['Правильный', 'Ответ 2', 'Ответ 3'], correct: 1 },
  { question: 'В чем измеряется расстояние между звездами?', answers: ['Ответ A', 'Ответ B', 'Правильный'], correct: 0 },
  { question: 'Звезды какого цвета не существует?', answers: ['Правильный', 'Ответ 2', 'Ответ 3'], correct: 1 },
  { question: 'Сколько спутников у Сатурна?', answers: ['Ответ A', 'Ответ B', 'Правильный'], correct: 2 },
  { question: 'Как назывался космический корабль, на котором был совершен первый полёт в космос?', answers: ['Ответ 1', 'Правильный', 'Ответ 3'], correct: 0 },
  { question: 'На какой планете Солнечной системы наблюдается самый крупный циклон?', answers: ['Ответ A', 'Ответ B', 'Ответ C'], correct: 2 },
  { question: 'Что в переводе с греческого означает «комета»?', answers: ['Ответ 1', 'Ответ 2', 'Правильный'], correct: 1 },
  { question: 'Что такое Супернова (Supernova)?', answers: ['Ответ A', 'Ответ B', 'Ответ C'], correct: 0 },
  { question: 'Из чего состоит атмосфера Венеры?', answers: ['Ответ 1', 'Ответ 2', 'Ответ 3'], correct: 2 },
  { question: 'Какой космонавт первым совершил выход в открытый космос?', answers: ['Ответ A', 'Правильный', 'Ответ C'], correct: 1 },
  { question: 'Какая планета Солнечной системы имеет спутник с самой плотной атмосферой?', answers: ['Правильный', 'Ответ 2', 'Ответ 3'], correct: 0 },
  { question: 'К какому созвездию принадлежит полярная звезда?', answers: ['Ответ A', 'Ответ B', 'Правильный'], correct: 1 },
  { question: 'Что такое «Солнечный ветер»?', answers: ['Правильный', 'Ответ 2', 'Ответ 3'], correct: 0 },
  { question: 'Какой планетой является Юпитер?', answers: ['Ответ A', 'Ответ B', 'Правильный'], correct: 0 },
  { question: 'В каком году был запущен первый искусственный спутник Земли?', answers: ['Ответ 1', 'Правильный', 'Ответ 3'], correct: 1 },
  { question: 'Какая планета Солнечной системы весит больше прочих планет и лун вместе взятых ?', answers: ['Ответ A', 'Ответ B', 'Ответ C'], correct: 1 },
  { question: 'Что несут с собой радиоволны, исходящие от звёзд?', answers: ['Ответ 1', 'Ответ 2', 'Правильный'], correct: 0 },
  { question: 'Какая страна первой запустила в космос искусственный спутник Земли?', answers: ['Ответ A', 'Ответ B', 'Ответ C'], correct: 0 },
  { question: 'В каком году был совершён первый в истории орбитальный полёт в космос живых существ с успешным возвращением на Землю?', answers: ['Ответ 1', 'Ответ 2', 'Ответ 3'], correct: 1 },
  { question: 'Кто был первой женщиной-космонавтом?', answers: ['Ответ A', 'Правильный', 'Ответ C'], correct: 1 },
  { question: 'Какая звезда является ярчайшей (после Солнца) звездой из визуально наблюдаемых с Земли?', answers: ['Правильный', 'Ответ 2', 'Ответ 3'], correct: 0 },
  { question: 'Как появилась Луна?', answers: ['Ответ A', 'Ответ B', 'Правильный'], correct: 2 },
  { question: 'Как называется установка, которая применяется для тренировки и космонавтов, и подводников, а также в медицине при лечении некоторых заболеваний?', answers: ['Правильный', 'Ответ 2', 'Ответ 3'], correct: 1 },
  { question: 'Что является причиной образования кратеров на Луне?', answers: ['Ответ A', 'Ответ B', 'Правильный'], correct: 2 },
  { question: 'Как называется прибор для наблюдения небесных тел?', answers: ['Ответ 1', 'Правильный', 'Ответ 3'], correct: 1 },
  { question: 'Полет Юрия Гагарина длился...', answers: ['Ответ A', 'Ответ B', 'Ответ C'], correct: 2 },
  { question: 'Когда был совершен первый полет человека в космос?', answers: ['Ответ 1', 'Ответ 2', 'Правильный'], correct: 0 },
  { question: 'Что означает слово «космос»?', answers: ['Ответ A', 'Ответ B', 'Ответ C'], correct: 2 },
  { question: 'Из чего состоит комета?', answers: ['Ответ 1', 'Ответ 2', 'Ответ 3'], correct: 0 },
  { question: 'Наука, изучающая небесные тела', answers: ['Ответ A', 'Правильный', 'Ответ C'], correct: 1 },
  { question: 'Как назывался космический корабль, на котором стартовал Ю. А. Гагарин?', answers: ['Правильный', 'Ответ 2', 'Ответ 3'], correct: 0 },
  { question: 'Какой ученый является изобретателем космической ракеты?', answers: ['Ответ A', 'Ответ B', 'Правильный'], correct: 0 }
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}



app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on('create-room', () => {
    const roomId = Math.random().toString(36).substr(2, 5);
    rooms[roomId] = { players: [], creator: socket.id, currentQuestion: 0, answers: {} };
 
    shuffledQuestions = shuffle(questions);
    selectedQuestions = shuffledQuestions.slice(0, 10);
    console.log(selectedQuestions);
    socket.join(roomId);
    socket.emit('room-created', roomId);
    console.log(`Room ${roomId} created`);
  });

  socket.on('join-room', (roomId, nickname) => {
    if (rooms[roomId]) {
      const imageIndex = Math.floor(Math.random()* (16-1)+1);
      const user = { id: socket.id, nickname, ready: false, image: `file${imageIndex}.png`, ship: `ship${imageIndex}.png`, score: 0 };
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
          io.to(roomId).emit('show-start-button', roomId);
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
        const currentQuestion = selectedQuestions[currentQuestionIndex];

        const elapsedTime = Date.now() - room.timerStart;
        const remainingTime = 60000 - elapsedTime;
        room.isQuestionActive = true;

        console.log(`Elapsed time: ${elapsedTime}, Remaining time: ${remainingTime}`);

        if (currentQuestion.correct === answerIndex) {
          player.score += 50 + remainingTime/1000;
          console.log("Ответ верный, ваш ответ " + answerIndex);
          console.log("Верный ответ " + currentQuestion.correct);
          console.log("Очки " + player.score);
        } else {
          console.log("Ответ не верный, ваш ответ " + answerIndex);
          console.log("Верный ответ " + currentQuestion.correct);
        }
        room.answers[nickname] = answerIndex;
  
        if (Object.keys(room.answers).length === room.players.length) {
          if (room.timer) {
            clearTimeout(room.timer);
          }
          room.isQuestionActive = false;
          setTimeout(() => {
            StartNextQuestion(roomId);
          }, 3000);
        }
      }
    }
  });

  socket.on('start-game', (roomId) => {
    setTimeout(() => {
      StartNextQuestion(roomId);
    }, 3000);
    console.log(selectedQuestions);
  })

});


function StartNextQuestion(roomId, answerIndex) {
  const room = rooms[roomId];
  if (room) {

    setTimeout(() => {
      io.to(roomId).emit('move-player', rooms[roomId].players);
    }, 1000);

    if (room.currentQuestion != selectedQuestions.length) {
      room.timerStart = Date.now();

      io.to(roomId).emit('next-question', selectedQuestions[room.currentQuestion], answerIndex);
      room.currentQuestion++;
      room.answers = {};

      if (room.timer) {
        clearTimeout(room.timer);
      }

      room.timer = setTimeout(() => {
        room.isQuestionActive = false;
        StartNextQuestion(roomId);
      }, 60000);

    } else {
      io.to(roomId).emit('quiz-ended', roomId);
    }
  }
}


server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});