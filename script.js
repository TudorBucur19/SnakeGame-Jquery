$(function(){

    const canvas = $('#canvas')[0];
    const ctx = canvas.getContext('2d');
    let score = 0;
    let scoreHistory = [0];    

    const LEFT = 'ArrowLeft';
    const UP = 'ArrowUp';
    const RIGHT = 'ArrowRight';
    const DOWN = 'ArrowDown';

    let keyPressed = DOWN;

    let gameSpeed = 100;
    let gameSize = 10;

    // const snakeSize = {
    //     snakeWidth: gameSize,
    //     snakeHieght: gameSize,
    //     blockSize: gameSize,
    // };
    // console.log(snakeSize);

    // const { snakeWidth, snakeHieght, blockSize } = snakeSize;

    let snakeWidth = 10;
    let snakeHieght = 10;
    let blockSize = 10;

    let snake = [
        {x: 40, y: 100},
        {x: 40, y: 100-blockSize},
        {x: 40, y: 100-blockSize * 2},
    ];
        
    const initialSnake= [
        {x: 40, y: 100},
        {x: 40, y: 100-blockSize},
        {x: 40, y: 100-blockSize * 2},
    ]; 
    
    

    $( "#difficulty_levels" ).on('change', function() {
        gameSpeed = $('option:selected').val();
    });

    $('.size_check').on('change', function(){
       gameSize = parseInt($('input[name="snakeSize"]:checked').val());
       snakeWidth = gameSize;
       snakeHieght = gameSize;
       blockSize = gameSize;    
    });
        

    const drawSnake = () => {
        $.each(snake, (index, value) => {
            ctx.fillStyle = 'red';
            ctx.fillRect(value.x, value.y, snakeWidth, snakeHieght);
            ctx.strokeStyle = 'white';
            ctx.strokeRect(value.x, value.y, snakeWidth, snakeHieght)
            if(index === 0) {
                // ctx.fillStyle = 'yellow';
                // ctx.fillRect(value.x, value.y, snakeWidth, snakeHieght);
                selfColision(value.x, value.y) && game.stop(handleGameOver);
                borderColision(value.x, value.y) && game.stop(handleGameOver);    
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
        $('audio#gameover')[0].play();
        $('.messageBox').fadeIn(1000, function() {
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
        ctx.fillStyle = 'green';
        ctx.fillRect(foodPosition.x, foodPosition.y, snakeWidth, snakeHieght);
    };

    //resets the snake and score
    const resetGame = () => {
        clearCanvas();
        snake = [...initialSnake];
        score = 0;
        $('.currentScore_score').text(score);
        keyPressed = DOWN;
    };
 
    const gameLoop = () => {
        clearCanvas();
        dropFood();
        drawSnake();
        moveSnake(keyPressed, snake, blockSize);
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
            },
            stop(callBack = false) {
                clearInterval(currentGame);
                callBack && callBack();
            }
        }
    };

    ////////////

    const game = gameClosure();

    $('#stopBtn').click(function() {
        game.stop()
    });

    $('#startBtn').click(function() {
        game.start()
    });

    $('#resetBtn').click(function() {
        resetGame();
    })
    
    $('#playAgainBtn').click(function() {
        $('.messageBox').fadeOut(1000, function() {
            $('.messageBox_content_recordMsg').hide();
            resetGame();
        });
        
    });

    $('#closeBtn').click(function() {
        $('.messageBox').fadeOut(1000);        
    });

});




//add game over message - done
//add styles to buttons and form - done
//keeps score history - done
//fix reset function - done
//refactor the snake moving to not iterate the whole array - done