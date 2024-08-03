const socket = io();
const images = [
  'file1.png',
  'file2.png',
  'file3.png',
  'file4.png',
  'file5.png',
  'file6.png',
  'file7.png',
  'file8.png',
  'file9.png',
  'file10.png',
  'file11.png',
  'file12.png',
  'file13.png',
  'file14.png',
  'file15.png',
  'file16.png',
  // Добавьте сюда остальные имена файлов изображений
];

document.getElementById('create-button').addEventListener('click', () => {
    const nickname = document.getElementById('input-nickname').value.trim();
    if (nickname) {
      console.log('Creating room with nickname:', nickname);
      socket.emit('create-room', nickname);
    }
  });
  
  document.getElementById('join-button').addEventListener('click', () => {
    const roomId = document.getElementById('input-room-code').value.trim();
    const nickname = document.getElementById('input-nickname').value.trim();
    if (roomId && nickname) {
      console.log('Joining room with ID and nickname:', roomId, nickname);
      socket.emit('join-room', roomId, nickname);
    }
  });
  
  document.getElementById('ready-button').addEventListener('click', () => {
    console.log('Player is ready');
    socket.emit('player-ready');
    document.getElementById('ready-button').disabled = true;
  });
  
  document.getElementById('submit-answer').addEventListener('click', () => {
    const answer = document.getElementById('answer-input').value.trim();
    console.log('Submitting answer:', answer);
    socket.emit('submit-answer', answer);
  });
  
  socket.on('room-created', (roomId) => {
    console.log('Room created with ID:', roomId);
    document.getElementById('start-form').style.display = 'none';
    document.getElementById('lobby').style.display = 'block';
  });
  
  socket.on('room-joined', (roomId) => {
    console.log('Room joined with ID:', roomId);
    document.getElementById('start-form').style.display = 'none';
    document.getElementById('lobby').style.display = 'block';
  });
  
  socket.on('user-joined', (users) => {
    const userList = document.getElementById('connected-users');
    userList.innerHTML = '';
    users.forEach(user => {
      const imageUrl = `../Images/Player/${user.image}`;
      userList.innerHTML += `
        <div style="display: flex; flex-direction: row; width: 80%; margin: 0 auto; align-items: center;">
          <img src="${imageUrl}" alt="" style="border: 1px solid transparent; border-radius: 15px; width: 70px; height: 90px; object-fit: cover;">
          <div style="margin: 0 15px;">
            <span>${user.nickname} ${user.ready ? '(Готов)' : ''}</span>
          </div>
        </div>
      `;
    });
  });
  
  socket.on('start-game', (isCreator) => {
    console.log('Game started');
    document.getElementById('lobby').style.display = 'none';
    if (isCreator) {
      document.getElementById('creator').style.display = 'block';
    } else {
      document.getElementById('player').style.display = 'block';
    }
  });
  
  socket.on('disconnect', () => {
    alert('Вы были отключены от сервера.');
    window.location.reload();
  });