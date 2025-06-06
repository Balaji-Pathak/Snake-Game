const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const timeBarContainer = document.getElementById('timeBar');
const timeBarFill = document.getElementById('timeBarFill');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const BIG_FOOD_SCORE = 5;
const BIG_FOOD_TIME = 10000;
const FOODS_FOR_BIG_FOOD = 5;

// Move initialization into DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile controls
    function initializeMobileControls() {
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');

        function handleControl(dx, dy, e) {
            e.preventDefault();
            if ((dx !== 0 && snake.dx === 0) || (dy !== 0 && snake.dy === 0)) {
                snake.dx = dx;
                snake.dy = dy;
            }
        }

        // Button controls
        upBtn.addEventListener('touchstart', (e) => handleControl(0, -1, e), { passive: false });
        downBtn.addEventListener('touchstart', (e) => handleControl(0, 1, e), { passive: false });
        leftBtn.addEventListener('touchstart', (e) => handleControl(-1, 0, e), { passive: false });
        rightBtn.addEventListener('touchstart', (e) => handleControl(1, 0, e), { passive: false });

        // Also add mouse click support for hybrid devices
        upBtn.addEventListener('mousedown', (e) => handleControl(0, -1, e));
        downBtn.addEventListener('mousedown', (e) => handleControl(0, 1, e));
        leftBtn.addEventListener('mousedown', (e) => handleControl(-1, 0, e));
        rightBtn.addEventListener('mousedown', (e) => handleControl(1, 0, e));
    }

    // Start the game and initialize controls
    resetGame();
    initializeMobileControls();
});

let snake = {
    x: 10,
    y: 10,
    dx: 1,
    dy: 0,
    cells: [],
    maxCells: 4
};

let food = {
    x: 15,
    y: 15
};

let score = 0;
let gameLoop;

// Add these constants at the

// Add these variables with other let declarations
let bigFood = null;
let bigFoodTimer = null;
let foodsEaten = 0;
let timeBarInterval = null;

// Add this function after other function declarations
function spawnBigFood() {
    bigFood = {
        x: Math.floor(Math.random() * (tileCount - 2)),
        y: Math.floor(Math.random() * (tileCount - 2)),
        size: 2
    };
    
    timeBarContainer.style.display = 'block';
    timeBarFill.style.width = '100%';
    
    let timeLeft = BIG_FOOD_TIME;
    timeBarInterval = setInterval(() => {
        timeLeft -= 100;
        timeBarFill.style.width = (timeLeft / BIG_FOOD_TIME * 100) + '%';
    }, 100);

    bigFoodTimer = setTimeout(() => {
        bigFood = null;
        timeBarContainer.style.display = 'none';
        clearInterval(timeBarInterval);
    }, BIG_FOOD_TIME);
}

// Modify the drawGame function to include big food
function drawGame() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Move snake
    snake.x += snake.dx;
    snake.y += snake.dy;

    // Wrap snake position
    if (snake.x < 0) snake.x = tileCount - 1;
    if (snake.x >= tileCount) snake.x = 0;
    if (snake.y < 0) snake.y = tileCount - 1;
    if (snake.y >= tileCount) snake.y = 0;

    // Keep track of where snake has been
    snake.cells.unshift({ x: snake.x, y: snake.y });

    // Remove tail
    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    // Draw big food if it exists
    if (bigFood) {
        ctx.fillStyle = 'gold';
        ctx.fillRect(
            bigFood.x * gridSize,
            bigFood.y * gridSize,
            gridSize * bigFood.size,
            gridSize * bigFood.size
        );
    }

    // Draw regular food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    // Draw snake and check collisions
    ctx.fillStyle = 'lime';
    snake.cells.forEach((cell, index) => {
        ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize - 2, gridSize - 2);

        // Check collision with regular food
        if (cell.x === food.x && cell.y === food.y) {
            snake.maxCells++;
            score += 1;
            foodsEaten++;
            scoreElement.textContent = score;
            food.x = Math.floor(Math.random() * tileCount);
            food.y = Math.floor(Math.random() * tileCount);

            // Check if it's time to spawn big food
            if (foodsEaten % FOODS_FOR_BIG_FOOD === 0 && !bigFood) {
                spawnBigFood();
            }
        }

        // Check collision with big food
        if (bigFood && 
            cell.x >= bigFood.x && 
            cell.x < bigFood.x + bigFood.size &&
            cell.y >= bigFood.y && 
            cell.y < bigFood.y + bigFood.size) {
            score += BIG_FOOD_SCORE;
            scoreElement.textContent = score;
            clearTimeout(bigFoodTimer);
            clearInterval(timeBarInterval);
            timeBarContainer.style.display = 'none';
            bigFood = null;
        }

        // Check collision with self
        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                showGameOver();
                clearInterval(gameLoop);
                return;
            }
        }
    });
}

// Modify resetGame function to reset big food related states
function resetGame() {
    snake.x = 10;
    snake.y = 10;
    snake.cells = [];
    snake.maxCells = 4;
    snake.dx = 1;
    snake.dy = 0;
    score = 0;
    scoreElement.textContent = score;
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    gameOverScreen.style.display = 'none';
    
    // Start new game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, 100);
}

function showGameOver() {
    gameOverScreen.style.display = 'flex';
    finalScoreElement.textContent = score;
}

function restartGame() {
    resetGame();
}

document.addEventListener('keydown', (e) => {
    // Left arrow
    if (e.key === 'ArrowLeft' && snake.dx === 0) {
        snake.dx = -1;
        snake.dy = 0;
    }
    // Right arrow
    else if (e.key === 'ArrowRight' && snake.dx === 0) {
        snake.dx = 1;
        snake.dy = 0;
    }
    // Up arrow
    else if (e.key === 'ArrowUp' && snake.dy === 0) {
        snake.dx = 0;
        snake.dy = -1;
    }
    // Down arrow
    else if (e.key === 'ArrowDown' && snake.dy === 0) {
        snake.dx = 0;
        snake.dy = 1;
    }
});