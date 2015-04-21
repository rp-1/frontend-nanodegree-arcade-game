// The Entity object holds stationary objects, both friend
// and foe, that live on screen for a time (set by the property
// 'lifespan', and then fade off.
var Entity = function(sprite, points) {
    this.sprite = sprite;   // the image that will be drawn on screen
    this.lifespan = 0;      // how long will object be visible on screen
    this.points = points;   // how many points will player get upon collision
    this.opacity = 1.0;     // needed to fade out object
}


Entity.prototype.spawn = function(x,y,lifespan) {
        this.lifespan = lifespan;
        this.opacity = 1.0;
        this.x = x
        this.y = y
}

Entity.prototype.update = function(dt) {
    this.lifespan -= 1;
    if(this.lifespan < 0) {
        this.reset();
    }      
}

Entity.prototype.render = function() {
    // Fade sprite when it's close to being removed from view
    if(this.lifespan < 5) {
        this.opacity -= .15;
        ctx.save();     // save the default opacity before modifying it
        ctx.globalAlpha=this.opacity;
         ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
         ctx.restore(); // restore default opacity
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

Entity.prototype.reset = function() {
    this.lifespan = 0;
    this.x = -100;
    this.y = -100;
}

// Enemies our player must avoid
var Enemy = function(row) {
    this.sprite = 'images/enemy-bug.png';
    this.speed = 0;
    this.y = row;   // each bug gets their own row
    this.reset();
}


// Reset bug to location offscreen, left, and a random y position
Enemy.prototype.reset = function() {
    this.x = (Math.random() * -400) - 100;
    this.speed = bug_speed;
    this.hasPooped = false;
    this.isPooping = false;
    this.poopCounter = 20;      // how long should bug pause while pooping
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {

    if(this.isPooping === false) {
        this.x += this.speed * dt;
        // If bug has not pooped this run, randomly decide if it's that time.
        if( !this.hasPooped && (Math.random() * 1000 < 30) && 
           (this.x % BLOCK_WIDTH < 10) && this.x >= 0 )    {
            this.poop();
        }
    } else {
        this.poopCounter--;
        if(this.poopCounter <= 0) {
            this.isPooping = false;
            this.speed = bug_speed;
        }
    }
    
    if(this.x > BLOCK_WIDTH * BLOCKS_HORIZONTAL) {
        this.reset();
    }
    
}


Enemy.prototype.poop = function() {

    // Find available poop to use/reuse so we
    // don't have to create these objects during game
    for(var i = 0; i < allPoop.length; i++) {
        if(allPoop[i].lifespan <= 0) {
            allPoop[i].spawn(this.x - 2, this.y, 200);
            this.isPooping = true;
            this.hasPooped = true;
            this.speed = 0;
            break;
        }
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

}

// Our main player object
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.startX = Math.floor(BLOCKS_HORIZONTAL / 2) * BLOCK_WIDTH;
    this.startY = (BLOCKS_VERTICAL - 1) * BLOCK_HEIGHT - GRASS_OFFSET;
    this.score = 0;
    this.lives = 3;
    this.reset();
}

Player.prototype.reset = function() {
    this.x = this.startX;
    this.y = this.startY;
}

Player.prototype.update = function(dt) {
    // TODO: Add pop up images at point of impact to show points gained/lost
    var enemy = isColliding(this.x, this.y, allEnemies);
    if(enemy) {
        gameMessage("Hit by a bug. Lose a life.");
        this.lives -= 1;
        if(this.lives === 0) {
            gameOver();
        } else {
            this.reset();
        }
    }
    
    var poop = isColliding(this.x, this.y, allPoop);
    if(poop) {
        gameMessage("Ewww! Stepped in toxic poop! Lose a life and 50 points.");
        this.score += poop.points;
        this.lives -= 1;
        if(this.score < 0) {
            this.score = 0;
        }
        if(this.lives === 0) {
            gameOver();
        } else {
            this.reset();
        }
        poop.reset();
    }
       
    var gem = isColliding(this.x, this.y, allGems)
    if(gem) {
        gameMessage("Nice one! That color gem is worth " + gem.points + "!");
        this.score += gem.points;
        gem.reset();
    }
    
   console.log("gameOn is " + gameOn);
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.handleInput = function(kCode) {
    
    // We want player on screen between games but he shouldn't
    // be able to move.
    if(!gameOn) {
        return;
    }
    
    switch(kCode) {
        case 'left':
            this.x -= BLOCK_WIDTH;
            if(this.x <= 0) {
                this.x = 0;
            }
            break;
        case 'right':
            this.x += BLOCK_WIDTH;
            if(this.x >= (BLOCKS_HORIZONTAL) * BLOCK_WIDTH) {
                this.x = (BLOCKS_HORIZONTAL - 1) * BLOCK_WIDTH;
            }
            break;
        case 'up':
            this.y -= BLOCK_HEIGHT;
            // if bug is on top water tile, kill him
            if(this.y <= 0) {
                this.lives -= 1;
                this.reset();
                if(this.lives === 0) {
                    gameOver();
                }
            }
            break;
        case 'down':
            this.y += BLOCK_HEIGHT;
            if(this.y > this.startY) {
                this.y = this.startY;
            }
            break;
    }

}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var BLOCK_WIDTH = 101;
var BLOCK_HEIGHT = 83;
var BLOCKS_VERTICAL = 6;
var BLOCKS_HORIZONTAL = 5;
var GRASS_OFFSET = 21;
var COLLISION_PADDING = 50;

var bug_speed = 150;

var gameOn = false;     // main switch for game play

// html variables to control score display above canvas
var scoreDiv = document.getElementById("score");
var timeDiv = document.getElementById("time");
var livesDiv = document.getElementById("lives");
var msgDiv = document.getElementById("dash-message");

var allEnemies = [];

for(var i = 0; i < 3; i++) {
    var e = new Enemy( (i + 1) * BLOCK_HEIGHT - GRASS_OFFSET);
    allEnemies.push(e);
}

// each colored gem has different point value associated with it
var blueGem = new Entity("images/Gem-Blue.png", 50);
var greenGem = new Entity("images/Gem-Green.png", 75);
var orangeGem = new Entity("images/Gem-Orange.png", 100);
var allGems = [blueGem, greenGem, orangeGem];


var allPoop = [];
for(var i = 0; i < 6; i++) {
    var e = new Entity("images/poop.png", -50);
    e.id = i + 1;
    allPoop[i] = e;
}

var player = new Player();
var gameTimer = createTimer(45000);


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space'
    };
    
    player.handleInput(allowedKeys[e.keyCode]);
});

// Stop play. Wait for mouse click to restart a game
function gameOver() {
    gameOn = false;
    gameMessage("Game Over! Click anywhere to play again!", player.score);

}

// Called once we receive mouse click to start another game
function gameReset() {

    gameTimer = createTimer(45000); // 45 seconds countdown
    timeDiv.style.color = "white";
    player.score = 0;
    player.lives = 3;
    player.reset();
    allEnemies.forEach(function(enemy) {
        enemy.reset();
    });
    allPoop.forEach(function(poop) {
        poop.reset();
    });

    allGems.forEach(function(gem) {
        gem.reset();
    }); 
    gameMessage("Gems good. Water bad. Bugs bad. Bug poop toxic.", player.score);
    gameOn = true;
}

// Displays Message in black box on screen
// If score param not passed, it will not be printed
function gameMessage(text) {
    msgDiv.innerHTML = text;
}


// Takes x and y val of object and tests for collisions with all objects in arrayToCheck
// Returns true if collision found
function isColliding(x,y,arrayToCheck) {
    
    for(var i = 0; i < arrayToCheck.length; i++) {
        var item = arrayToCheck[i];
        if(x < item.x + COLLISION_PADDING && x + COLLISION_PADDING > item.x &&
           y < item.y + COLLISION_PADDING && y + COLLISION_PADDING > item.y) {
            return item;
        }
    }
    return false;
}

// Updates score, time, lives in html div above canvas
function updateDashboard() {
    scoreDiv.innerHTML = player.score;
    livesDiv.innerHTML = player.lives;
    if (gameOn) {
        var secs = gameTimer();

        if(secs < 10) {
            secs = "0" + secs.toString();
            timeDiv.style.color = "red";
        }
        timeDiv.innerHTML = secs;
        if(secs <= 0) {
            gameOver();
        }
    }
}


// Game timer counts down seconds until game over
// Logic from http://stackoverflow.com/questions/19244394/creating-a-timer-for-a-javascript-game-gives-undesirable-results

function createTimer(timeLeft) {
    var startTime = Date.now();
    return function() {
       return Math.floor((timeLeft - ( Date.now() - startTime )) / 1000);
    }
}
   
function handleClick(evt) {
    if(!gameOn) {
        gameReset();
    }

}
document.addEventListener('click', handleClick, false);
