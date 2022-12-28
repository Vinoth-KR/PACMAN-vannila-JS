import {LEVEL, OBJECT_TYPE} from './setup.js';
import { randomMovement } from './ghostMoves.js';
//Classes
import {GameBoard} from './GameBoard.js';
import {Pacman} from './Pacman.js';
import { Ghost } from './Ghost.js';

//Sounds
import soundDot from './sounds/munch.wav';
import soundPill from './sounds/pill.wav';
import soundGameStart from './sounds/game_start.wav';
import soundGameOver from './sounds/death.wav';
import soundGhost from './sounds/eat_ghost.wav';


//DOM Elements handler
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const startButton = document.querySelector('#start-button');

//Game CONSTANTS
const POWER_PILL_TIME = 7000; // milliseconds
const GLOBAL_SPEED = 80; // milliseconds

const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

//Basic Setup
let score = 0 ;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;

//Audio
function playAudio(audio){
    const soundEffect = new Audio(audio);
    soundEffect.play();
}

function gameOver(pacman, grid){
    playAudio(soundGameOver);
    document.removeEventListener('keydown', (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist)    
);

    gameBoard.showGameStatus(gameWin);

    clearInterval(timer);

    startButton.classList.remove('hide');
}

function checkCollision(pacman, ghosts){
    const collidedGhost = ghosts.find( ghost => pacman.pos === ghost.pos);

    if(collidedGhost){
        if(pacman.powerPill){

            playAudio(soundGhost);
            gameBoard.removeClassObject(collidedGhost.pos, [
                OBJECT_TYPE.GHOST,
                OBJECT_TYPE.SCARED,
                collidedGhost.name
            ]);
            collidedGhost.pos = collidedGhost.startPos;
            score += 100;            
        } else {
            gameBoard.removeClassObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
            gameBoard.rotateDiv(pacman.pos, 0);
            
            gameOver(pacman, gameGrid);
        }
    }
}

function gameLoop(pacman, ghosts){    
    gameBoard.moveCharacter(pacman);
    checkCollision(pacman, ghosts);

    ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
    checkCollision(pacman, ghosts);

    //Checking for dots
    if(gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)){

        playAudio(soundDot);
        gameBoard.removeClassObject(pacman.pos, [OBJECT_TYPE.DOT]);
        gameBoard.dotCount--;

        score += 10;
    }

    //Checking for powerpills
    if(gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)){

        playAudio(soundPill);
        gameBoard.removeClassObject(pacman.pos, [OBJECT_TYPE.PILL]);        
        
        pacman.powerPill = true;
        score += 50;

        clearTimeout(powerPillTimer);
        powerPillTimer = setTimeout(
            () => (pacman.powerPill = false),
            POWER_PILL_TIME
        );
    }

    if(pacman.powerPill !== powerPillActive){
        powerPillActive = pacman.powerPill;
        ghosts.forEach((ghost)=> ghost.isScared = pacman.powerPill);
    } 

    //Win scenario
    if(gameBoard.dotCount === 0) {
        gameWin = true;
        gameOver(pacman, ghosts);        
    }

    scoreTable.innerHTML = score;    
}

function startGame(){
    gameWin = false;
    powerPillActive = false;
    score = 0;

    playAudio(soundGameStart);
    startButton.classList.add('hide');

    gameBoard.createGrid(LEVEL);

    const pacman = new Pacman(2, 287);
    gameBoard.addClassObject(287,[OBJECT_TYPE.PACMAN]);

    document.addEventListener('keydown', (e) =>
        pacman.handleKeyInput(e, gameBoard.objectExist)    
    );

    const ghosts = [
        new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY), 
        new Ghost(2, 209, randomMovement, OBJECT_TYPE.PINKY),
        new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
        new Ghost(1, 251, randomMovement, OBJECT_TYPE.CLYDE)   
    ];

    timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

//Initialize game
startButton.addEventListener('click', startGame);