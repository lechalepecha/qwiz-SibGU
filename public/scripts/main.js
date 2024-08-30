const socket = io();
const app = document.getElementById('app');
let gameStarted =false;



const state = {
  roomId: null,
  nickname: null,
  users: [],
  isCreator: false,
  images: [
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
  ],
  ship: [
    'ship1.png',
    'ship2.png',
    'ship3.png',
    'ship4.png',
    'ship5.png',
    'ship6.png',
    'ship7.png',
    'ship8.png',
    'ship9.png',
    'ship10.png',
    'ship11.png',
    'ship12.png',
    'ship13.png',
    'ship14.png',
    'ship15.png',
    'ship16.png',    
  ]
};

function renderView(view) {
  app.innerHTML = view;
}

function renderMainForm() {
  renderView(`
    <form id="form" class="form-main" style="margin-top: 20px;">
      <div class="div-main">
        <h1>Код комнаты</h1>
        <input type="text" id="input-room-code" placeholder="Введите код комнаты" class="input-main">
      </div>
      <div class="div-main">
        <h1>Никнейм</h1>
        <input type="text" id="input-nickname" placeholder="Введите ваше имя" class="input-main">
      </div>
      <div class="div-main">
        <button id="Connect" type="button" class="button-main">
          <span>Присоединиться к игре</span>
        </button>
      </div>
      <div class="div-main">
        <button id="CreateGame" type="button" class="button-main">
          <span>Создать игру</span>
        </button>
      </div>
    </form>
  `);

  const inputRoomCode = document.getElementById('input-room-code');
  const inputNickname = document.getElementById('input-nickname');
  const buttonCreation = document.getElementById('CreateGame');
  const buttonConnection = document.getElementById('Connect');


  buttonCreation.addEventListener('click', (e) => {
    e.preventDefault();
    const nickname = inputNickname.value.trim();
    if (nickname) {
      state.nickname = nickname;
      socket.emit('create-room');
    } else {
      alert('Введите ваш никнейм');
    }
  });

  buttonConnection.addEventListener('click', (e) => {
    e.preventDefault();
    const roomCode = inputRoomCode.value.trim();
    const nickname = inputNickname.value.trim();
    if (roomCode && nickname) {
      state.roomId = roomCode;
      state.nickname = nickname;
      socket.emit('join-room', roomCode, nickname);
    } else {
      alert('Введите код комнаты и ваш никнейм');
    }
  });
}

function renderLobby() {
  renderView(`
    <div class="form-main question" style="max-height:80vh">
      <div class="div-main" style="height: 40px;">
        <h1 style="text-align: center; text-transform:none;">ОЖИДАНИЕ ИГРОКОВ: ${state.roomId}</h1>
      </div>
      <div id="connected-users" class="div-main lobby">
      
      </div>
      
      <div class="div-main">
        <button id="ready-button" class="button-main" type="button">
          <span id="ready-text">Готов</span>
        </button>
      </div>
      
    </div>
  `);

  const readyButton = document.getElementById('ready-button');
  if(state.isCreator){
    readyButton.style.display = 'none';
  }
  readyButton.addEventListener('click', () => {
    socket.emit('player-ready', state.roomId, state.nickname);
    readyButton.disabled = true;
    readyButton.classList = 'active';
  });

  updateLobbyUsers();
}

socket.on('show-start-button', (roomId) => {
  const readyButton = document.getElementById('ready-button');
  const readyText = document.getElementById('ready-text');
  readyText.innerText = 'Начать игру';
  if(state.isCreator){
    readyText.innerText = 'Начать игру';
    readyButton.style.display = 'block';
    readyButton.addEventListener('click', () => {
      socket.emit('start-game', roomId);
      readyButton.disabled = true;
      readyButton.classList = 'active';
    });
  }
})

socket.on('next-question', (questionData, currentQuestion) => {
  renderGameInterface(questionData, currentQuestion);
});

function renderGameInterface(questionData, currentQuestion) {
  if(gameStarted == false && state.isCreator){
    renderCreatorInterface();
    updateCreatorQuestions(questionData, currentQuestion);
    updateLobbyGame();
    gameStarted = true;
  }
  else{
    if (state.isCreator) {
      updateCreatorQuestions(questionData, currentQuestion);
    } else {
      renderPlayerInterface(questionData, currentQuestion);
    }
  }
}


function renderCreatorInterface() {
  renderView(`
      <div style="display: flex; flex-direction: row; max-height:100vh; overflow:auto;" id="gameOverlay" >
        <div id="question" class="div-q">
        <div class="container">
            <div class="blackhole" id="blackhole">
              <div class="megna">
                <div class="black"></div>
              </div>
            </div>
        </div>
        </div>
        
        <div id="connected-users" class="players-game">
        </div>

      </div>

      <div id="winnerOverlay">
      </div> 

  `);
}

function updateCreatorQuestions(questionData, currentQuestion){
  const questiondiv = document.getElementById('question');
  if(questiondiv){
    questiondiv.innerHTML ='';
    questiondiv.innerHTML = `
    <form action="" class="form-main question" style="width: 100%;">        
      <div class="div-main" style="height: 40px;">
          <h1 style="text-align: center; ">Вопрос ${currentQuestion+1}</h1>
      </div>

      <div class="div-main" style="height:150px; justify-content: flex-start;">
          <h1 class="input-main" style="text-wrap:wrap; word-wrap: break-word;">${questionData.question}</h1>
      </div>
    </form>
    <div class=" div-q container">
            <div class="blackhole" id="blackhole">
              <div class="megna">
                <div class="black"></div>
              </div>
            </div>
        </div>
    `;
  }
}

function renderPlayerInterface(questionData, currentQuestion) {
renderView(`
  <form class="form-main question">
      <div class="div-main" style="height: 40px;">
          <h1 style="text-align: center;">Вопрос ${currentQuestion+1}</h1>
      </div>
      <div class="div-main" style="height:150px; justify-content: flex-start;">
          <h1 id="Question" class="input-main" style="text-wrap:wrap; word-wrap: break-word;">${questionData.question}</h1>
      </div>
  </form>
  <form action="" class="form-main" style="margin-top: 20px; border-radius: 10px; min-height: 200px; overflow: visible;">
    <div class="div-main" style="width:100%; margin-top: 20px;">
        ${questionData.answers.map((answer, index) => `
          <button id="btn-${index}" role="button" class="button-main answer">
            <span>${answer}</span>
          </button>
        `).join('')}
    </div>
  </form>
`);

document.querySelectorAll('.button-main.answer').forEach((button, index) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    sendAnswer(index);
    document.querySelectorAll('.button-main.answer').forEach((btn) => {
      btn.disabled = true;
      if(btn.id === "btn-"+index){
        btn.classList += ' active';
      }
    });
});
});
}

function sendAnswer(answerIndex) {
socket.emit('answer', state.roomId, state.nickname, answerIndex);
document.querySelectorAll('.button-main.answer').forEach((button) => {
  button.style.disabled= true;
  });
};

function addUserToLobby(user){
  const userList = document.getElementById('connected-users');
  const imageUrl = `../Images/Player/${user.image}`;
  const shipURL = `../Images/other/${user.ship}`;
  const userDiv = document.createElement('div');
  userDiv.classList.add('player');
  userDiv.style.display = 'flex';
  userDiv.style.flexDirection = 'row';
  userDiv.style.flexWrap = 'nowrap';
  userDiv.style.width = '80%';
  userDiv.style.margin = '5px auto';
  userDiv.style.alignItems='center';
  
  userDiv.innerHTML = `
          <div style="display:flex; flex-direction:row; flex-wrap: nowrap; width:150px;">
            <img src="${imageUrl}" alt="" class="playerImg">
            <img src="${shipURL}" alt="" class="playerShip" style="">
          </div>
          <div style="margin: 0 auto;">
            <span>${user.nickname} ${user.ready ? '(Готов)' : ''}</span>
          </div>`;
  userList.appendChild(userDiv);
}

function updateLobbyUsers() {
  const userList = document.getElementById('connected-users');
  if (userList) {
    userList.innerHTML = '';
    state.users.forEach(user => {
      addUserToLobby(user);
    });
  }
}

socket.on('move-player', (players) => {
  players.forEach(player =>{
    const playerDiv = document.getElementById('player-'+ player.id);
    if(playerDiv){
      const score = player.score;
      const newLoc = score;
      playerDiv.style.transform = `translateX(${newLoc}px)`;
    }
  })
})



function updateLobbyGame() {
  const userList = document.getElementById('connected-users');
  if (userList) {
    userList.innerHTML = '';
    state.users.forEach(user => {
      const imageUrl = `../Images/other/${user.ship}`;
      userList.innerHTML += `
        <div id="player-${user.id}" class="playerGame">
          <div style="margin: 0 15px; color: white; text-align:center;">
            <span style="text-align:center;">${user.nickname}</span>
          </div>
          <img src="${imageUrl}" alt="" style="width: 90px; object-fit: cover;">
        </div>
      `;
      
    });
  }
}

socket.on('room-created', (roomId) => {
  state.roomId = roomId;
  state.isCreator = true;
  renderLobby();
});

socket.on('room-joined', (roomId, users) => {
  state.roomId = roomId;
  state.users = users;
  renderLobby();
});

socket.on('user-joined', (users) => {
  const newUser = users.find(user => !state.users.some(u => u.id === user.id));
  if (newUser) {
    state.users.push(newUser);
    addUserToLobby(newUser);
  }
  else {
    state.users = users;
    updateLobbyUsers();
  }
});

socket.on('user-left', (users) => {
  state.users = users;
  if(gameStarted){
    updateLobbyGame();
    console.log(gameStarted);
  }
  else{
    updateLobbyUsers();
  }

});

socket.on('quiz-ended', (roomId)=> {

      if(state.isCreator){
      const gameOverlay = document.getElementById('gameOverlay');
      const winner = state.users.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr);
      
      const app = document.getElementById('app');
      app.innerHTML+=`<svg id="overlay" class="svgOver" width="100%" height="100%">
      </svg>`
        
      const targetElement = document.getElementById('blackhole');

    setTimeout(() => {
      const rect = targetElement.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const svg = document.getElementById('overlay');

    svg.innerHTML = '';

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
svg.appendChild(defs);

const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
grad.setAttribute('id', 'grad');
grad.setAttribute('x1', '0%');
grad.setAttribute('y1', '0%');
grad.setAttribute('x2', '100%');
grad.setAttribute('y2', '0%');

const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stop1.setAttribute('offset', '0%');
stop1.setAttribute('stop-color', '#ff4500');
grad.appendChild(stop1);

const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stop2.setAttribute('offset', '50%');
stop2.setAttribute('stop-color', '#ff4500');
grad.appendChild(stop2);

const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stop3.setAttribute('offset', '100%');
stop3.setAttribute('stop-color', '#ff9900');
grad.appendChild(stop3);

defs.appendChild(grad);

// Для создания тени
const shadow1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
shadow1.setAttribute('cx', centerX);
shadow1.setAttribute('cy', centerY);
shadow1.setAttribute('rx', 0);
shadow1.setAttribute('ry', 0);
shadow1.setAttribute('fill', '#fcbd3e');
shadow1.setAttribute('class', 'animate-ellipse');
svg.appendChild(shadow1);

const shadow2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
shadow2.setAttribute('cx', centerX);
shadow2.setAttribute('cy', centerY);
shadow2.setAttribute('rx', 0);
shadow2.setAttribute('ry', 0);
shadow2.setAttribute('fill', '#fd7a4d');
shadow2.setAttribute('class', 'animate-ellipse');
svg.appendChild(shadow2);

const shadow3 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
shadow3.setAttribute('cx', centerX);
shadow3.setAttribute('cy', centerY);
shadow3.setAttribute('rx', 0);
shadow3.setAttribute('ry', 0);
shadow3.setAttribute('fill', '#ff0b6b');
shadow3.setAttribute('class', 'animate-ellipse');
svg.appendChild(shadow3);

    const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    ellipse.setAttribute('cx', centerX);
    ellipse.setAttribute('cy', centerY);
    ellipse.setAttribute('rx', 0);
    ellipse.setAttribute('ry', 0);
    ellipse.setAttribute('fill', 'rgba(0, 0, 0, 1)');
    ellipse.setAttribute('class', 'animate-ellipse'); 
    svg.appendChild(ellipse);
    },2000);



      setTimeout(() => {
        gameOverlay.innerHTML='';
        winnerOverlay.setAttribute("class", "changeBGColor");
        winnerOverlay.innerHTML=`<marquee scrolldelay="31.599598274948427" scrollamount="177.548816699292">
    <div class="x" style="width:37.60960970890379px"></div>
  </marquee>
  <marquee scrolldelay="19.556208179781763" scrollamount="93.26812992590955">
    <div class="x" style="width:90.13043282356492px"></div>
  </marquee>
  <marquee scrolldelay="77.14744111797415" scrollamount="130.8412373286725">
    <div class="x" style="width:14.141152481204081px"></div>
  </marquee>
  <marquee scrolldelay="97.32734538724807" scrollamount="69.10506764096436">
    <div class="x" style="width:32.005478894570324px"></div>
  </marquee>
  <marquee scrolldelay="48.925821602615315" scrollamount="186.3106250757915">
    <div class="x" style="width:17.201586599837317px"></div>
  </marquee>
  <marquee scrolldelay="5.090581677660366" scrollamount="199.54683006639792">
    <div class="x" style="width:50.79786122797228px"></div>
  </marquee>
  <marquee scrolldelay="24.002477110822795" scrollamount="95.63218991675105">
    <div class="x" style="width:41.14199355304192px"></div>
  </marquee>
  <marquee scrolldelay="19.354023317537084" scrollamount="106.23866710029806">
    <div class="x" style="width:54.33458605353264px"></div>
  </marquee>
  <marquee scrolldelay="18.86895970398561" scrollamount="73.21016325203604">
    <div class="x" style="width:85.77323087066047px"></div>
  </marquee>
  <marquee scrolldelay="62.57412872947792" scrollamount="149.39881826603414">
    <div class="x" style="width:30.735796147600226px"></div>
  </marquee>
  <marquee scrolldelay="27.323089165154624" scrollamount="55.304523698632934">
    <div class="x" style="width:76.56917961373934px"></div>
  </marquee>
  <marquee scrolldelay="97.5548423729581" scrollamount="120.51286538361944">
    <div class="x" style="width:54.444097803469276px"></div>
  </marquee>
  <marquee scrolldelay="38.24347734451021" scrollamount="105.51522229046316">
    <div class="x" style="width:59.9756144757806px"></div>
  </marquee>
  <marquee scrolldelay="8.412424531899966" scrollamount="116.30940168565789">
    <div class="x" style="width:32.47253841376555px"></div>
  </marquee>
  <marquee scrolldelay="61.69440357348945" scrollamount="179.07410271734847">
    <div class="x" style="width:53.2517905821477px"></div>
  </marquee>
  <marquee scrolldelay="60.912039680721364" scrollamount="175.73457703012514">
    <div class="x" style="width:26.72983760782493px"></div>
  </marquee>
  <marquee scrolldelay="23.122690511938803" scrollamount="141.64356453943503">
    <div class="x" style="width:25.958910848756766px"></div>
  </marquee>
  <marquee scrolldelay="85.95790181095009" scrollamount="51.7756572175787">
    <div class="x" style="width:27.46994858934247px"></div>
  </marquee>
  <marquee scrolldelay="14.338840076175586" scrollamount="87.53669868888795">
    <div class="x" style="width:38.239942865717424px"></div>
  </marquee>
  <marquee scrolldelay="55.989606608563825" scrollamount="197.56459261189082">
    <div class="x" style="width:14.119850668446606px"></div>
  </marquee>
  <marquee scrolldelay="36.40329452455256" scrollamount="192.82420835152314">
    <div class="x" style="width:22.755981214653318px"></div>
  </marquee>
  <marquee scrolldelay="92.33490503699329" scrollamount="76.07587978583898">
    <div class="x" style="width:76.39289579856714px"></div>
  </marquee>
  <marquee scrolldelay="20.337112546595936" scrollamount="196.25559063571689">
    <div class="x" style="width:23.767602489112097px"></div>
  </marquee>
  <marquee scrolldelay="84.22697827254251" scrollamount="138.21525097883966">
    <div class="x" style="width:98.73470355504078px"></div>
  </marquee>
  <marquee scrolldelay="28.34948455608459" scrollamount="103.08808553092894">
    <div class="x" style="width:63.06086053617183px"></div>
  </marquee>
  <marquee scrolldelay="90.05106857565126" scrollamount="126.45504449416076">
    <div class="x" style="width:19.435899668485792px"></div>
  </marquee>
  <marquee scrolldelay="66.5073656996425" scrollamount="140.58347651698745">
    <div class="x" style="width:90.22364073229025px"></div>
  </marquee>
  <marquee scrolldelay="51.131987512793884" scrollamount="124.72250058554512">
    <div class="x" style="width:77.61667119766646px"></div>
  </marquee>
  <marquee scrolldelay="3.3443773848318203" scrollamount="63.95567411987935">
    <div class="x" style="width:79.03866466501577px"></div>
  </marquee>
  <marquee scrolldelay="12.500678806837207" scrollamount="180.3152720175192">
    <div class="x" style="width:62.856061412216725px"></div>
  </marquee>
  <marquee scrolldelay="55.44012540550669" scrollamount="115.54591913409254">
    <div class="x" style="width:36.53127808850988px"></div>
  </marquee>
  <marquee scrolldelay="38.91262114342096" scrollamount="183.0987000547577">
    <div class="x" style="width:32.43619630568945px"></div>
  </marquee>
  <marquee scrolldelay="54.11057663933969" scrollamount="101.24872830779145">
    <div class="x" style="width:28.564617855434904px"></div>
  </marquee>
  <marquee scrolldelay="22.795037566191457" scrollamount="134.878336631427">
    <div class="x" style="width:53.790734160531194px"></div>
  </marquee>
  <marquee scrolldelay="9.20033429931799" scrollamount="67.2929714458036">
    <div class="x" style="width:22.829101268935666px"></div>
  </marquee>
  <marquee scrolldelay="37.27820394761254" scrollamount="159.43331876526122">
    <div class="x" style="width:72.60624389869682px"></div>
  </marquee>
  <marquee scrolldelay="25.156728118259487" scrollamount="129.35173123529424">
    <div class="x" style="width:13.518086468947446px"></div>
  </marquee>
  <marquee scrolldelay="90.10546709616638" scrollamount="94.68929699662752">
    <div class="x" style="width:98.25571707705315px"></div>
  </marquee>
  <marquee scrolldelay="84.72230925639919" scrollamount="139.72265842096297">
    <div class="x" style="width:75.47233559536072px"></div>
  </marquee>
  <marquee scrolldelay="85.11179669613959" scrollamount="182.6612090586407">
    <div class="x" style="width:81.37901160962288px"></div>
  </marquee>
  <marquee scrolldelay="49.32291887168952" scrollamount="89.49168215840746">
    <div class="x" style="width:18.27542578306089px"></div>
  </marquee>
  <marquee scrolldelay="34.024918251297635" scrollamount="174.06076030546882">
    <div class="x" style="width:46.22242143669113px"></div>
  </marquee>
  <marquee scrolldelay="38.39212477954885" scrollamount="194.30878135791832">
    <div class="x" style="width:17.540733943966217px"></div>
  </marquee>
  <marquee scrolldelay="77.22419678613142" scrollamount="173.08835997774793">
    <div class="x" style="width:45.31416865569521px"></div>
  </marquee>
  <marquee scrolldelay="75.72304561477794" scrollamount="195.700926116428">
    <div class="x" style="width:82.09104485321468px"></div>
  </marquee>
  <marquee scrolldelay="96.84862793000455" scrollamount="89.74469569993633">
    <div class="x" style="width:16.657876622396564px"></div>
  </marquee>
  <marquee scrolldelay="1.9448796302863558" scrollamount="63.65401748813756">
    <div class="x" style="width:51.41475653302978px"></div>
  </marquee>
  <marquee scrolldelay="77.74020020993906" scrollamount="126.35223025646782">
    <div class="x" style="width:88.9924976681659px"></div>
  </marquee>
  <marquee scrolldelay="68.70665320230542" scrollamount="54.6069853266566">
    <div class="x" style="width:75.0701467553082px"></div>
  </marquee>
  <marquee scrolldelay="56.40262572916066" scrollamount="184.01991389395573">
    <div class="x" style="width:84.48810619499956px"></div>
  </marquee>
  `;
  const imageUrl = `../Images/other/${winner.ship}`;
      winnerOverlay.innerHTML+=` <div id="player-${winner.id}" class="winner" >
            <div style="margin:15px; color: white; text-align:center;">
              <span style="text-align:center; font-weight:600; font-size:30px;">${winner.nickname}</span>
            </div>
            <img class="moving-object" src="${imageUrl}" alt="" style=" width: 200px; object-fit: cover;">
            <div style="margin:15px; color: white; text-align:center;">
              <h1 style="text-align:center; font-weight:600; font-size:35px;">ПОБЕДИТЕЛЬ</h1>
            </div>
              <button id="exit-button" class="button-main" style="display:none; opacity:1; margin:10px 0;" type="button">
                <span>Выход</span>
              </button>
            
          </div>`;

  setTimeout(() => {
    const block = document.getElementById('player-'+ winner.id);
    if(block)
      console.log(winner.id);
    const buttonExt = document.getElementById('exit-button');
    buttonExt.style.display = 'block';
    const exit = document.getElementById('exit-button');
    exit.addEventListener('click', () => { 
      window.location.reload();
    })
  }, 20000);

  }, 5000);
      
  
    }
    else{
      alert('Игра окончена');

      setTimeout(() => {
        window.location.reload();
      }, 60000);
    }
  
})

socket.on('disconnect', () => {
  alert('Вы были отключены от сервера.');
  renderMainForm();
});

socket.on('error', (message) => {
  alert(message);
});

renderMainForm();