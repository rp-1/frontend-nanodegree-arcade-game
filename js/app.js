var BLOCK_WIDTH = 101;
var BLOCK_HEIGHT = 83;
var BLOCKS_VERTICAL = 6;
var BLOCKS_HORIZONTAL = 5;
var GRASS_OFFSET = 21;

var Goodie = function(type) {
    this.speed = 0;
    this.type = type;
    if(this.type === "orange") {
        this.sprite = "images/Gem-Orange.png";
        this.points = 500;
    } else if(this.type === "blue") {
        this.sprite = "images/Gem-Blue.png";
        this.points = 100;
    }

    this.x = (Math.floor(Math.random() * BLOCKS_HORIZONTAL)) * BLOCK_WIDTH;
    this.y = (Math.floor(Math.random() * BLOCKS_VERTICAL)) * BLOCK_HEIGHT - GRASS_OFFSET;
    
    
}

Goodie.prototype.update = function(dt) {
    var me = this;
    console.log("This.x is " + this.x);
    allEnemies.forEach(function(enemy) {
        if(me.x < enemy.x + 100 && me.x + 100 > enemy.x &&
          me.y < enemy.y + 100 && me.y + 100 > enemy.y) {
            console.log("A " + me.type + " collided with a beastie");
            me.speed = enemy.speed;
        }
    });

    me.x += me.speed * dt;
  
}   

Goodie.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

var Poop = function(x,y) {
    this.sprite = "images/poop.png";
    this.lifespan = 300;

    this.x = x;
    this.y = y;
    this.opacity = 1.0;

}

Poop.prototype.update = function(dt) {
    this.lifespan--;
    if(this.lifespan <= 0) {
        this.x = -100;
    }
}

Poop.prototype.render = function() {
    
    if(this.lifespan < 5) {
        this.opacity -= .1;
        ctx.save();
        ctx.globalAlpha=this.opacity;
         ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
         ctx.restore();
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

}


var Entity = function(type, sprite) {
    this.type = type;
    this.sprite = sprite;
    this.id = -1;
    this.reset();
    
    this.spawn = function() {
        this.alive = true;
        this.x = 100;
        this.y = 100;
        this.speed = 2;
    }
    
}

Entity.prototype.init = function(x,y,speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
}

Entity.prototype.update = function(dt) {
    this.x += this.speed * dt;
    if(this.x > BLOCK_WIDTH * BLOCKS_HORIZONTAL) {
        console.log("resetting entity " + this.id);
        this.reset();
    }
}

Entity.prototype.render = function() {
    if(this.alive) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

Entity.prototype.reset = function() {
    this.alive = false;
    this.x = 0;
    this.y = 0;
    this.speed = 0;  
    console.log("entity " + this.id + " is resset");
}



function Pool(type, sprite) {
    var size = 5;
    var pool = [];
    
    this.init = function() {
        for(var i = 0; i < size; i++) {
            var entity = new Entity(type, sprite);
            entity.init(100, 100, 2);
            entity.id = i + 1;
            pool[i] = entity;
        }
    };
    
    this.activate = function() {
        var none = false;
        for(var i = 0; i < size; i++) {
            if(!pool[i].alive) {
                console.log("entity " + pool[i].id + " is not alive and should respawn");
            } else {
                console.log("entity " + pool[i].id + " is alive right now at " + pool[i].x + " " + pool[i].y);
            }
            
            if(!pool[i].alive) {
                none = true;
                pool[i].spawn();
                console.log("Found an available entity id is " + pool[i].id);
                break;
            }
        }
        if(none === false) {
            console.log("there are no more available entities");
        }
        
    }
    this.animate = function() {
        for(var i = 0; i < size; i++) {
            if(pool[i].alive) {
                pool[i].update(1);
                pool[i].render();
            }
        }
    };
    
    
}


// Enemies our player must avoid
var Enemy = function() {

    this.sprite = 'images/enemy-bug.png';
    this.speed = 0;
    this.reset();
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    if(this.isPooping === false) {
        this.x += this.speed * dt;
        if( !this.hasPooped && (Math.random() * 1000 < 10) && (this.x % BLOCK_WIDTH < 10) )    {
            this.poop();
        }
    } else {
        this.poopCounter--;
        if(this.poopCounter <= 0) {
            this.isPooping = false;
        }
    }
    
    if(this.x > BLOCK_WIDTH * BLOCKS_HORIZONTAL) {
        this.reset();
    }
    
}

Enemy.prototype.reset = function() {
    this.x = Math.random() * -200;
    this.y = Math.floor(Math.random() * 6) * BLOCK_HEIGHT - GRASS_OFFSET;
 
    this.speed = 50;
    this.hasPooped = false;
    this.isPooping = false;
    this.poopCounter = 100;
    this.direction = 1;
}

Enemy.prototype.poop = function() {
    this.poopCounter = 100;
    this.isPooping = true;
    this.hasPooped = true; // only one poop per run
    allPoop.push(new Poop(this.x, this.y));
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Our main player object
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.x = 3 * BLOCK_WIDTH;
    this.y = 3 * BLOCK_HEIGHT - GRASS_OFFSET;
    console.log("Player created");
}

Player.prototype.update = function(dt) {
    var self = this;
    /*
    allPoop.forEach(function(poop) {
        if(self.x < poop.x + 75 && self.x + 75> poop.x &&
          self.y < poop.y + 75 && self.y + 75 > poop.y) {
            console.log("STEPPED IN BUG SHIT!");
        }
    });
       
    allEnemies.forEach(function(enemy) {
        if(self.x < enemy.x + 75 && self.x + 75> enemy.x &&
          self.y < enemy.y + 75 && self.y + 75 > enemy.y) {
            console.log("COLLISION WITH ENEMY");
        }
    });
    
    allGoodies.forEach(function(goodie) {
        if(self.x < goodie.x + 75 && self.x + 75> goodie.x &&
          self.y < goodie.y + 75 && self.y + 75 > goodie.y) {
            console.log("COLLISION WITH " + goodie.type + " GOODIE!");
        }
    });
       */ 
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.handleInput = function(kCode) {
    
    switch(kCode) {
        case 'left':
            this.x -= BLOCK_WIDTH;
            break;
        case 'right':
            this.x += BLOCK_WIDTH;
            break;
        case 'up':
            this.y -= BLOCK_HEIGHT;
            break;
        case 'down':
            this.y += BLOCK_HEIGHT;
    }

    this.render();
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

/*
var pool = new Pool();
pool.init();
pool.activate();
pool.animate();
console.log("context is " + window.ctx);
*/

var ddd = new Enemy();
//var ppp = new Entity("poop", "images/poop.png");
//ppp.init(200,300,3);

var aaa = new Pool("poop", "images/poop.png");
aaa.init();
aaa.activate();


var allEnemies = [new Enemy()];
var player = new Player();
var allPoop = [];
//var allGoodies = [];

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    
    player.handleInput(allowedKeys[e.keyCode]);
});
