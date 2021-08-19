$(function(){

    const canvas = $('#canvas')[0];
    const ctx = canvas.getContext('2d');
    let score = 0;
    let scoreHistory = [0];    
    let isPlaying = false;
    let isGameOver = false;

    const LEFT = 'ArrowLeft';
    const UP = 'ArrowUp';
    const RIGHT = 'ArrowRight';
    const DOWN = 'ArrowDown';

    let keyPressed = DOWN;

    let gameSpeed = 100;
    let snakeSize = 10;

    const initialSnake = (block) => {
        return [
        {x: 40, y: 100},
        {x: 40, y: 100-block},
        {x: 40, y: 100-block * 2},
        ];
    };

    let snake = initialSnake(snakeSize);
        

    $( "#difficulty_levels" ).on('change', function() {
        gameSpeed = $('option:selected').val();        
        resetGame();
    });

    $('.size_check').on('change', function(){
       snakeSize = parseInt($('input[name="snakeSize"]:checked').val());
       resetGame();
    });
        

    const drawSnake = () => {
        $.each(snake, (index, value) => {
            ctx.fillStyle = '#51f542';
            ctx.fillRect(value.x, value.y, snakeSize, snakeSize);
            ctx.strokeStyle = 'white';
            ctx.strokeRect(value.x, value.y, snakeSize, snakeSize)
            if(index === 0) {
                // ctx.fillStyle = 'yellow';
                // ctx.fillRect(value.x, value.y, snakeSize, snakeSize);
                (selfColision(value.x, value.y) || borderColision(value.x, value.y)) && game.stop(handleGameOver);   
                eatFood();            
            }
        });
    };

    const selfColision = (x, y) => {
        return snake.filter((snakePiece, index) => index !== 0 && snakePiece.x === x && snakePiece.y === y).length > 0;
    };

    const borderColision = (x, y) => {
        return outOfCanvas = x >= canvas.width || y >= canvas.height || x < -1 || y < -1; 
    };

    const handleGameOver = () => {
        const oldRecord = Math.max(...scoreHistory);
        scoreHistory.push(score);
        isGameOver = true;
        $('audio#gameover')[0].play();
        $('.messageBox').fadeIn(1000, function() {
            toggleDisable('#stopBtn', '#resetBtn')
            const record = Math.max(...scoreHistory);
            $('.bestScore_score').text(record);
            if (score > oldRecord) {
                $('.messageBox_content_recordMsg').show(500).text('Congrats! You hit a new record!');
            }
        });
    };

    //triggered only when snake reaches the food
    const eatFood = () => {
        const lastCell = snake[snake.length - 1];
        if (JSON.stringify(snake[0]) === JSON.stringify(foodPosition)) {
            $('audio#eat')[0].play();
            snake.push(lastCell);
            score += 1;
            $('.currentScore_score').text(score);
            foodPosition = getFoodPosition();
        }       
    };

    //used an object instead a switch case to check the direction key
    const moveSnake = (direction, body, cellSize) => {
        const lastCell = body.length - 1;
        const moveCases = {
            ArrowDown: {x: body[0].x, y: body[0].y + cellSize},
            ArrowUp: {x: body[0].x, y: body[0].y - cellSize},
            ArrowRight: {x: body[0].x + cellSize, y: body[0].y},
            ArrowLeft: {x: body[0].x - cellSize, y: body[0].y},
        };
            body.unshift(moveCases[direction]);
            body.pop(body[lastCell]);              
    };

    
    $(document).keydown(function(e) {
        if($.inArray(e.key, [DOWN, UP, LEFT, RIGHT]) !== -1) {
            keyPressed = checkKeyAllowed(e.key);
        };
    });


    const checkKeyAllowed = (tempKey) => {
        let key;
        switch(tempKey) {
            case DOWN:
                key = (keyPressed !== UP) ? tempKey : keyPressed;
                return key;
            case UP: 
                key = (keyPressed !== DOWN) ? tempKey : keyPressed;
                return key;
            case RIGHT:
                key = (keyPressed !== LEFT) ? tempKey : keyPressed;
                return key;
            case LEFT:
                key = (keyPressed !== RIGHT) ? tempKey : keyPressed;
                return key;
            default:
                 return;
        }
    };

    const generateRandomNumber = (max) => {
        return Math.floor(Math.random() * (max/20)) * 20;
    };

    //recursive function to generate food position outside the snake body
    const getFoodPosition = () => {
        let foodCoords = {
            x: generateRandomNumber(canvas.width),
            y: generateRandomNumber(canvas.height)
        };

        if (JSON.stringify(snake).includes(JSON.stringify(foodCoords))) {
            return getFoodPosition();
        };

        return foodCoords;
    };
    
    let foodPosition = getFoodPosition();

    const clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    //places the food on the map
    const dropFood = () => {
        ctx.fillStyle = '#fa0525';
        ctx.fillRect(foodPosition.x, foodPosition.y, snakeSize, snakeSize);
    };

    //resets the snake and score
    const resetGame = () => {
        clearCanvas();
        snake = initialSnake(snakeSize);
        score = 0;
        $('.currentScore_score').text(score);
        keyPressed = DOWN;
        isGameOver = false; 
    };

    const toggleDisable = (...args) => {
        $('' + args.toString()).prop('disabled', function(i, status) {
            return !status;
        });
    };

    const startStopGame = () => {
        if (isPlaying) {
            game.stop();
        } else {
            game.start();
        };            
        toggleDisable('#startBtn', '#stopBtn');
    };
 
    const gameLoop = () => {
        clearCanvas();
        dropFood();
        drawSnake();
        moveSnake(keyPressed, snake, snakeSize);
    };

    // closure used to start an stop the game
    function gameClosure() {
        function game() {
            gameLoop();
        }

        let currentGame;

        return {
            start() {
                currentGame = setInterval(game, gameSpeed);
                isPlaying = true;
            },

            stop(callBack = false) {
                isPlaying = false;
                clearInterval(currentGame);
                callBack && callBack();
            }
        }
    };

    const game = gameClosure();

    ////////////

    $('#stopBtn').click(function() {
        startStopGame();
    });

    $('#startBtn').click(function() {
        startStopGame();
    });

    $('#resetBtn').click(function() {
        resetGame();
    })
    
    $('#playAgainBtn').click(function() {
        $('.messageBox').fadeOut(1000, function() {
            $('.messageBox_content_recordMsg').hide();
            resetGame();
            toggleDisable('#startBtn', '#resetBtn');
        });
        
    });

    $('#closeBtn').click(function() {
        $('.messageBox').fadeOut(1000, function() {
            toggleDisable('#startBtn', '#resetBtn');
        });        
    });

    // start and pause the game by pressing SPACE bar
    $(document).keydown(function(e) { 
        if (isGameOver) return; 
        if (e.key === " ") {
            startStopGame();
        }
    });
 
}); 
  