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
let isVictoryReached = false;
let checkWinInterval;


// --- 1. Lógica do Botão "Não" (Fuga total na tela) ---
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


// --- 2. Lógica do Botão "Sim" (Iniciar Jogo) ---
btnSim.addEventListener('click', () => {
    perguntaContainer.classList.add('escondido');
    
    // Resetar o botão 'Não' e o estilo 'fixed'
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
        // Tempo do pulo aumentado para 800ms (0.8s), deve coincidir com o CSS!
        setTimeout(() => {
            mario.classList.remove('jump');
            isJumping = false;
        }, 800); 
    }
}

// O comando para pular (Espaço/Seta para Cima)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault(); 
        jump();
    }
});

// NOVO: Comando para pular na TELA (Toque no celular)
gameContainer.addEventListener('touchstart', (event) => {
    jump();
});


// --- Lógica do Jogo ---

function generateObstacle() {
    if (obstaclesPassed >= MAX_OBSTACLES && !isVictoryReached) {
        placeFlag();
        return;
    }
    
    // 1. Sorteio do tipo de obstáculo (50% cano, 50% tartaruga)
    const isPipe = Math.random() < 0.5;
    
    const obstacle = document.createElement('div');
    let obstacleWidth;
    let obstacleHeight;

    if (isPipe) {
        // Cano (Pipe)
        obstacle.classList.add('obstacle');
        obstacleWidth = 40; 
        obstacleHeight = 60; 
    } else { 
        // Tartaruga (Turtle)
        obstacle.classList.add('obstacle', 'turtle-obstacle'); 
        obstacleWidth = 55; 
        obstacleHeight = 35; 
    }
    
    // Ajuste de dimensões para mobile
    if (window.innerWidth <= 600) {
        if (isPipe) {
            obstacleWidth = 30; 
            obstacleHeight = 45; 
        } else {
            obstacleWidth = 40; 
            obstacleHeight = 25; 
        }
    }

    // Aplica as dimensões via style
    obstacle.style.width = obstacleWidth + 'px';
    obstacle.style.height = obstacleHeight + 'px';
    
    gameContainer.appendChild(obstacle);

    let obstaclePosition = 700; 

    function moveObstacle() {
        if (!gameStarted) return; 

        obstaclePosition -= gameSpeed; 
        obstacle.style.right = (700 - obstaclePosition) + 'px'; 

        // Checar se o obstáculo saiu da tela
        if (obstaclePosition < -obstacleWidth) { 
            obstacle.remove();
            obstaclesPassed++;
            scoreDisplay.textContent = `OBSTÁCULOS: ${obstaclesPassed}/${MAX_OBSTACLES}`;

            if (obstaclesPassed === MAX_OBSTACLES) {
                clearTimeout(obstacleGenerationTimeout);
            }
            return; 
        } 
        
        // Detecção de colisão
        const marioRect = mario.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        if (
            // Colisão Horizontal
            marioRect.left < obstacleRect.right &&
            marioRect.right > obstacleRect.left &&
            // Colisão Vertical
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
    
    if (obstaclesPassed < MAX_OBSTACLES) {
        obstacleGenerationTimeout = setTimeout(generateObstacle, nextObstacleTime);
    }
}

function placeFlag() {
    if (isVictoryReached) return;
    isVictoryReached = true;
    
    const flag = document.createElement('div');
    flag.id = 'bandeirinha';
    gameContainer.appendChild(flag);
    
    setTimeout(() => {
        flag.style.right = '50px'; 
    }, 100);

    // Verifica a colisão com a bandeira (Vitória)
    checkWinInterval = setInterval(() => {
        const marioRect = mario.getBoundingClientRect();
        const flagRect = flag.getBoundingClientRect();

        // Se o Mario tocar a bandeira
        if (marioRect.left < flagRect.right && marioRect.right > flagRect.left) {
            clearInterval(checkWinInterval);
            winGame();
        }
    }, 50); 
}

function startGame() {
    gameStarted = true;
    obstaclesPassed = 0;
    isVictoryReached = false;
    gameSpeed = 5; 
    scoreDisplay.textContent = `OBSTÁCULOS: 0/${MAX_OBSTACLES}`;
    
    // Limpar elementos e intervalos antigos
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
    const flag = document.getElementById('bandeirinha');
    if (flag) flag.remove();
    clearTimeout(obstacleGenerationTimeout);
    clearInterval(checkWinInterval);

    generateObstacle();
}

function gameOver() {
    gameStarted = false;
    clearTimeout(obstacleGenerationTimeout);
    clearInterval(checkWinInterval);
    alert("Oh não, Mario caiu! Tente novamente para resgatar sua princesa!");
    startGame(); // Reinicia automaticamente
}

function winGame() {
    gameStarted = false;
    clearTimeout(obstacleGenerationTimeout);
    clearInterval(checkWinInterval);
    
    // Remove o jogo
    gameContainer.classList.add('escondido');
    
    // Mostra a mensagem e inicia a digitação
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