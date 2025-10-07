const btnNao = document.getElementById('btnNao');
const btnSim = document.getElementById('btnSim');
const perguntaContainer = document.getElementById('pergunta-container');
const gameContainer = document.getElementById('game-container');
const mario = document.getElementById('mario');
const scoreDisplay = document.getElementById('score');
const mensagemFinal = document.getElementById('mensagem-final');

let isJumping = false;
let gameStarted = false;
let obstaclesPassed = 0;
const MAX_OBSTACLES = 10; 
let gameSpeed = 5; 
let obstacleGenerationTimeout;
let distanceScore = 0; 
let scoreInterval;     

let highScores = {
    distance: 0,
    obstacles: 0
};

// --- FUNÇÃO DE RECORDE ---
function loadHighScores() {
    const savedScores = localStorage.getItem('marioHighScores');
    if (savedScores) {
        highScores = JSON.parse(savedScores);
    }
}

// --- Lógica do Botão "Não" (Fuga) ---
btnNao.addEventListener('mouseover', () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const btnWidth = btnNao.offsetWidth;
    const btnHeight = btnNao.offsetHeight;

    const newX = Math.floor(Math.random() * (windowWidth - btnWidth - 20)) + 10;
    const newY = Math.floor(Math.random() * (windowHeight - btnHeight - 20)) + 10;
    
    btnNao.style.position = 'fixed'; 
    btnNao.style.left = `${newX}px`;
    btnNao.style.top = `${newY}px`;
});


// --- Lógica do Botão "Sim" (Inicia o Jogo) ---
btnSim.addEventListener('click', () => {
    perguntaContainer.classList.add('escondido');
    
    btnNao.style.position = 'absolute';
    btnNao.style.left = 'auto';
    btnNao.style.top = 'auto';

    gameContainer.classList.remove('escondido');
    startGame();
});

// --- Lógica do Pulo do Mario ---
function jump() {
    if (!isJumping && gameStarted) {
        isJumping = true;
        mario.classList.add('jump');
        setTimeout(() => {
            mario.classList.remove('jump');
            isJumping = false;
        }, 800); 
    }
}

// Controles (Teclado e Toque na Tela)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault(); 
        jump();
    }
});
gameContainer.addEventListener('touchstart', (event) => {
    jump();
});


// --- FUNÇÃO DE PARTÍCULAS ---
function spawnVictoryParticles() {
    const numParticles = 30; 
    const types = ['flag', 'heart'];

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        
        const type = types[Math.floor(Math.random() * types.length)]; 
        particle.classList.add('victory-particle', type);

        if (type === 'heart') {
            particle.textContent = '❤️'; 
        }

        particle.style.left = `${Math.random() * 100}%`; 
        
        const delay = Math.random() * 2.5; 
        particle.style.animationDelay = `${delay}s`;

        particle.style.animationDuration = `${3 + Math.random() * 2}s`; 

        document.body.appendChild(particle);

        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    }
}


// --- Lógica do Jogo ---
function generateObstacle() {
    if (obstaclesPassed >= MAX_OBSTACLES) {
        clearTimeout(obstacleGenerationTimeout);
        return; 
    }
    
    const isPipe = Math.random() < 0.5;
    const obstacle = document.createElement('div');
    let obstacleWidth;
    let obstacleHeight;

    if (isPipe) {
        obstacle.classList.add('obstacle');
        obstacleWidth = 40; 
        obstacleHeight = 60; 
    } else { 
        obstacle.classList.add('obstacle', 'turtle-obstacle'); 
        obstacleWidth = 55; 
        obstacleHeight = 35; 
    }
    
    if (window.innerWidth <= 600) {
        if (isPipe) {
            obstacleWidth = 30; 
            obstacleHeight = 45; 
        } else {
            obstacleWidth = 40; 
            obstacleHeight = 25; 
        }
    }

    obstacle.style.width = obstacleWidth + 'px';
    obstacle.style.height = obstacleHeight + 'px';
    
    gameContainer.appendChild(obstacle);

    let obstaclePosition = 700; 

    function moveObstacle() {
        if (!gameStarted) return; 

        obstaclePosition -= gameSpeed; 
        obstacle.style.right = (700 - obstaclePosition) + 'px'; 

        if (obstaclePosition < -obstacleWidth) { 
            obstacle.remove();
            
            if (obstaclesPassed < MAX_OBSTACLES) {
                obstaclesPassed++;
                updateScoreDisplay(); 

                if (obstaclesPassed === MAX_OBSTACLES) {
                    clearTimeout(obstacleGenerationTimeout);
                    winGame(); 
                    return; 
                }
            }
            return; 
        } 
        
        // Detecção de colisão
        const marioRect = mario.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        if (
            marioRect.left < obstacleRect.right &&
            marioRect.right > obstacleRect.left &&
            marioRect.bottom > obstacleRect.top
        ) {
            gameOver();
            return; 
        }
        
        requestAnimationFrame(moveObstacle);
    }
    requestAnimationFrame(moveObstacle);

    // Agendar o próximo obstáculo
    gameSpeed = Math.min(10, gameSpeed + 0.05); 
    const minObstacleGap = Math.max(500, 2000 - obstaclesPassed * 100);
    const maxObstacleGap = Math.max(1500, 3000 - obstaclesPassed * 100);
    const nextObstacleTime = Math.random() * (maxObstacleGap - minObstacleGap) + minObstacleGap;
    
    if (obstaclesPassed < MAX_OBSTACLES - 1) { 
        obstacleGenerationTimeout = setTimeout(generateObstacle, nextObstacleTime);
    }
}

function updateScoreDisplay() {
    scoreDisplay.innerHTML = `
        OBSTÁCULOS: ${obstaclesPassed}/${MAX_OBSTACLES} <br>
        <small>(Recorde: ${highScores.obstacles})</small> <br>
        DISTÂNCIA: ${distanceScore}m <br>
        <small>(Recorde: ${highScores.distance}m)</small>
    `;
}


function startGame() {
    gameStarted = true;
    obstaclesPassed = 0;
    gameSpeed = 5; 
    distanceScore = 0; 
    
    loadHighScores();
    updateScoreDisplay();

    // Inicia o contador de distância
    clearInterval(scoreInterval); 
    scoreInterval = setInterval(() => {
        if (gameStarted) {
            distanceScore += 1;
            updateScoreDisplay();
        }
    }, 100); 

    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
    clearTimeout(obstacleGenerationTimeout);

    generateObstacle();
}

function gameOver() {
    gameStarted = false;
    clearTimeout(obstacleGenerationTimeout);
    clearInterval(scoreInterval); 

    // Salva novo recorde
    if (distanceScore > highScores.distance) {
        highScores.distance = distanceScore;
    }
    if (obstaclesPassed > highScores.obstacles) {
        highScores.obstacles = obstaclesPassed;
    }
    localStorage.setItem('marioHighScores', JSON.stringify(highScores));

    alert(`Oh não, Mario caiu! 
    Distância: ${distanceScore}m (Recorde: ${highScores.distance}m)
    Obstáculos: ${obstaclesPassed} (Recorde: ${highScores.obstacles})
    
    Tente novamente para resgatar sua princesa!
    `);
    startGame(); 
}

function winGame() {
    gameStarted = false;
    clearTimeout(obstacleGenerationTimeout);
    clearInterval(scoreInterval); 
    
    gameContainer.classList.add('escondido');
    
    // Chama a chuva de partículas de vitória
    spawnVictoryParticles(); 

    // Atualiza o recorde
    highScores.obstacles = MAX_OBSTACLES; 
    if (distanceScore > highScores.distance) {
        highScores.distance = distanceScore;
    }
    localStorage.setItem('marioHighScores', JSON.stringify(highScores));
    
    mensagemFinal.classList.remove('escondido');
    typeMessages();
}

// --- Mensagens Interativas (Efeito Digitação) ---
const MESSAGES = [
    "Parabéns, minha heroína!",
    "Você é a mais linda que eu conheço! Quero ver você e te encher de beijos. ❤️",
    "Venha para cá amanhã assistir um filme comigo!"
];

const messageElements = [
    document.getElementById('msg-line1'),
    document.getElementById('msg-line2'),
    document.getElementById('msg-line3')
];

function typeMessages(messageIndex = 0) {
    if (messageIndex >= MESSAGES.length) return;

    const targetElement = messageElements[messageIndex];
    const fullText = MESSAGES[messageIndex];
    let charIndex = 0;
    targetElement.textContent = ""; 

    const typingInterval = setInterval(() => {
        if (charIndex < fullText.length) {
            targetElement.textContent += fullText.charAt(charIndex);
            charIndex++;
        } else {
            clearInterval(typingInterval);
            targetElement.classList.add('complete'); 
            
            setTimeout(() => {
                typeMessages(messageIndex + 1);
            }, 1000); 
        }
    }, 70); 
}

// Carrega os scores ao iniciar
loadHighScores();