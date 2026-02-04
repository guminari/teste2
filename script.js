// Tetris Game Implementation
document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('nextPiece');
    const nextCtx = nextCanvas.getContext('2d');
    const holdCanvas = document.getElementById('holdPiece');
    const holdCtx = holdCanvas.getContext('2d');

    // Game constants
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    const COLORS = [
        null,
        '#FF0D72', // I
        '#0DC2FF', // J
        '#0DFF72', // L
        '#F538FF', // O
        '#FF8E0D', // S
        '#FFE138', // T
        '#3877FF'  // Z
    ];

    // Tetromino shapes
    const SHAPES = [
        [],
        [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
        [[2,0,0], [2,2,2], [0,0,0]],                   // J
        [[0,0,3], [3,3,3], [0,0,0]],                   // L
        [[4,4], [4,4]],                                // O
        [[0,5,5], [5,5,0], [0,0,0]],                   // S
        [[0,6,0], [6,6,6], [0,0,0]],                   // T
        [[7,7,0], [0,7,7], [0,0,0]]                    // Z
    ];

    // Game state
    let board = createBoard();
    let score = 0;
    let level = 1;
    let lines = 0;
    let gameOver = false;
    let paused = false;
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;

    // Current piece
    let player = {
        pos: {x: 0, y: 0},
        matrix: null,
        score: 0,
        nextPiece: null,
        heldPiece: null,
        canHold: true
    };

    // Initialize the game
    resetGame();

    // Create empty board
    function createBoard() {
        return Array.from(Array(ROWS), () => Array(COLS).fill(0));
    }

    // Reset game state
    function resetGame() {
        board = createBoard();
        score = 0;
        level = 1;
        lines = 0;
        gameOver = false;
        paused = false;
        dropInterval = 1000;
        
        updateStats();
        
        // Generate first pieces
        player.heldPiece = null;
        player.canHold = true;
        player.nextPiece = createPiece();
        resetPlayer();
    }

    // Reset player position and get new piece
    function resetPlayer() {
        player.matrix = player.nextPiece;
        player.nextPiece = createPiece();
        player.pos.y = 0;
        player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
        
        // Check if game over
        if (collide()) {
            gameOver = true;
            alert('Game Over!');
        }
        
        drawNextPiece();
        drawHoldPiece();
    }

    // Create random piece
    function createPiece() {
        const rand = Math.floor(Math.random() * 7) + 1;
        return SHAPES[rand].map(row => [...row]);
    }

    // Draw the board
    function drawBoard() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawMatrix(board, {x: 0, y: 0});
        drawMatrix(player.matrix, player.pos);
    }

    // Draw a matrix
    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = COLORS[value];
                    ctx.fillRect(
                        (x + offset.x) * BLOCK_SIZE,
                        (y + offset.y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                    
                    // Add 3D effect
                    ctx.strokeStyle = '#000';
                    ctx.strokeRect(
                        (x + offset.x) * BLOCK_SIZE,
                        (y + offset.y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                }
            });
        });
    }

    // Draw next piece preview
    function drawNextPiece() {
        nextCtx.fillStyle = '#000';
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

        if (player.nextPiece) {
            const offsetX = (nextCanvas.width / BLOCK_SIZE - player.nextPiece[0].length) / 2;
            const offsetY = (nextCanvas.height / BLOCK_SIZE - player.nextPiece.length) / 2;
            
            player.nextPiece.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        nextCtx.fillStyle = COLORS[value];
                        nextCtx.fillRect(
                            (x + offsetX) * BLOCK_SIZE,
                            (y + offsetY) * BLOCK_SIZE,
                            BLOCK_SIZE,
                            BLOCK_SIZE
                        );
                        
                        nextCtx.strokeStyle = '#000';
                        nextCtx.strokeRect(
                            (x + offsetX) * BLOCK_SIZE,
                            (y + offsetY) * BLOCK_SIZE,
                            BLOCK_SIZE,
                            BLOCK_SIZE
                        );
                    }
                });
            });
        }
    }

    // Draw hold piece
    function drawHoldPiece() {
        holdCtx.fillStyle = '#000';
        holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);

        if (player.heldPiece) {
            const offsetX = (holdCanvas.width / BLOCK_SIZE - player.heldPiece[0].length) / 2;
            const offsetY = (holdCanvas.height / BLOCK_SIZE - player.heldPiece.length) / 2;
            
            player.heldPiece.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        holdCtx.fillStyle = COLORS[value];
                        holdCtx.fillRect(
                            (x + offsetX) * BLOCK_SIZE,
                            (y + offsetY) * BLOCK_SIZE,
                            BLOCK_SIZE,
                            BLOCK_SIZE
                        );
                        
                        holdCtx.strokeStyle = '#000';
                        holdCtx.strokeRect(
                            (x + offsetX) * BLOCK_SIZE,
                            (y + offsetY) * BLOCK_SIZE,
                            BLOCK_SIZE,
                            BLOCK_SIZE
                        );
                    }
                });
            });
        }
    }

    // Collision detection
    function collide() {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (board[y + o.y] &&
                    board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    // Merge piece to board
    function merge() {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    // Rotate matrix
    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    // Player rotation
    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        
        while (collide()) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    // Player movement
    function playerMove(dir) {
        player.pos.x += dir;
        if (collide()) {
            player.pos.x -= dir;
        }
    }

    // Player drop
    function playerDrop() {
        player.pos.y++;
        if (collide()) {
            player.pos.y--;
            merge();
            resetPlayer();
            clearLines();
            updateStats();
        }
        dropCounter = 0;
    }

    // Hard drop
    function playerHardDrop() {
        while (!collide()) {
            player.pos.y++;
        }
        player.pos.y--;
        merge();
        resetPlayer();
        clearLines();
        updateStats();
        dropCounter = 0;
    }

    // Hold piece
    function playerHold() {
        if (!player.canHold) return;
        
        if (player.heldPiece === null) {
            player.heldPiece = createPiece(); // Create a copy of current piece type
            resetPlayer();
        } else {
            // Swap current piece with held piece
            const temp = player.matrix;
            player.matrix = player.heldPiece;
            player.heldPiece = temp;
            player.pos.y = 0;
            player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
            
            // Check if game over after hold
            if (collide()) {
                gameOver = true;
                alert('Game Over!');
            }
        }
        
        player.canHold = false;
        drawHoldPiece();
    }

    // Clear completed lines
    function clearLines() {
        let linesCleared = 0;
        outer: for (let y = ROWS - 1; y >= 0; --y) {
            for (let x = 0; x < COLS; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }

            // Remove the line
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            ++y; // Recheck the same row index after removal
            
            linesCleared++;
        }
        
        if (linesCleared > 0) {
            // Calculate score based on lines cleared
            const linePoints = [40, 100, 300, 1200]; // Points for 1, 2, 3, 4 lines
            score += linePoints[linesCleared - 1] * level;
            lines += linesCleared;
            
            // Level up every 10 lines
            level = Math.floor(lines / 10) + 1;
            
            // Increase speed with level
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
            
            updateStats();
        }
    }

    // Update stats display
    function updateStats() {
        document.getElementById('score').textContent = score;
        document.getElementById('level').textContent = level;
        document.getElementById('lines').textContent = lines;
    }

    // Game loop
    function update(time = 0) {
        if (gameOver || paused) {
            requestAnimationFrame(update);
            return;
        }
        
        const deltaTime = time - lastTime;
        lastTime = time;
        
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        
        drawBoard();
        requestAnimationFrame(update);
    }

    // Event listeners for buttons
    document.getElementById('startBtn').addEventListener('click', () => {
        if (gameOver) {
            resetGame();
        }
        paused = false;
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
        paused = !paused;
    });

    document.getElementById('resetBtn').addEventListener('click', resetGame);

    // Keyboard controls
    document.addEventListener('keydown', event => {
        if (gameOver || paused) return;
        
        switch (event.keyCode) {
            case 37: // Left arrow
                playerMove(-1);
                break;
            case 39: // Right arrow
                playerMove(1);
                break;
            case 40: // Down arrow
                playerDrop();
                break;
            case 38: // Up arrow
                playerRotate(1);
                break;
            case 32: // Space
                playerHardDrop();
                break;
            case 67: // C key
                playerHold();
                break;
        }
    });

    // Start the game loop
    update();
});