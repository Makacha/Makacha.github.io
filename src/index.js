const gravity = 0.1;
const jumpSpeed = -4;
const elastic = 10;
const obstacleWidth = 50;
var obstacleSpeed = -1.5;
var obstacles = [];

function startGame() {
  myGame.start();
  myCharacter = new component(40, 40,"img/character.jpg", 50, 120, "image");
  myScore = new component("30px", "Arial", "black", 10, 40, "text", "Score: ");
  highScore = new component("30px", "Arial", "black", 10, 80, "text", "High Score: ");
  myScore.value = highScore.value = 0;
  jumpSound = new sound("sound/jump_sound.wav");
}

function endGame() {
  var overSound = new sound("sound/gameover.mp3");
  overSound.play();
  highScore.value += myScore.value;
  myScore.value = 0;
  myScoreBoard.open();
}

var myGame = {
  canvas: document.createElement("canvas"),
  start: function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    this.frameCount = 0;
    this.canvas.style.backgroundImage = "url('img/background.jpg')";
    this.canvas.style.backgroundSize = "cover";
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(updateGameArea, 10);
  },
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop: function() {
    clearInterval(this.interval);
    endGame();
  }
}

var myScoreBoard = {
  canvas: document.createElement("canvas"),
  open: function() {
    this.canvas.width = 200;
    this.canvas.height = 200;
    this.context = this.canvas.getContext("2d");
    this.canvas.style.backgroundColor = "white";
    this.frameCount = 0;
    document.body.appendChild(this.canvas);
  }
}

function component(width, height, color, x, y, type, text) {
  this.type = type;
  if (type == "image") {
    this.image = new Image();
    this.image.src = color;
  }
  this.width = width;
  this.height = height;
  this.text = text;
  this.x = x;
  this.y = y;
  this.speedX = 0;
  this.speedY = 0;
  this.speedJump = jumpSpeed;
  this.update = function () {
    this.speedY += gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.y + this.height > myGame.canvas.height) {
      this.y = myGame.canvas.height - this.height;
      this.speedY = this.speedJump;
      this.speedJump += elastic * gravity;
    }
    if (this.y < 0) {
      this.y = 0;
      this.speedY = 0;
    }
    this.render();
  }
  this.render = function() {
    var cont = myGame.context;
    if (this.type == "text") {
      cont.font = this.width + " " + this.height;
      cont.fillStyle = color;
      cont.fillText(this.text + this.value, this.x, this.y);
      return;
    }
    if (this.type == "image") {
      cont.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
  this.crash = function(otherObj) {
    var myleft = this.x;
    var myright = this.x + (this.width);
    var mytop = this.y;
    var mybottom = this.y + (this.height);
    var otherleft = otherObj.x;
    var otherright = otherObj.x + (otherObj.width);
    var othertop = otherObj.y;
    var otherbottom = otherObj.y + (otherObj.height);
    var crash = true;
    if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
      crash = false;
    }
    return crash;
  }
}

function updateObstacles() {
  console.log(obstacles.length);
  for (var i = obstacles.length - 1; i >= 0; i--) {
    var inc = 0;
    if (obstacles[i].x + obstacleWidth >= myCharacter.x) {
      inc++;
    }
    obstacles[i].x += obstacleSpeed;
    if (obstacles[i].x + obstacleWidth >= myCharacter.x) {
      inc--;
    }
    if (obstacles[i].x < -obstacleWidth) {
      obstacles.splice(i, 1);
    }
    if (obstacles[i].y == 0) {
      myScore.value += inc;
    }
  }
  for (var i = 0; i < obstacles.length; i++) {
    obstacles[i].render();
  }
}

function checkCollision() {
  for (var i = 0; i < obstacles.length; i++) {
    if (myCharacter.crash(obstacles[i])) {
      myGame.stop();
    }
  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function updateGameArea() {
  myGame.clear();
  myGame.frameCount++;
  if (myGame.frameCount % 200 == 1) {
    var h1 = rand(50, 500);
    var obstacle = new component(obstacleWidth, h1, "img/bottle.png", 1500, myGame.canvas.height - h1, "image");
    obstacles.push(obstacle);
    var h2 = rand(50, myGame.canvas.height - h1 - 200);
    obstacle = new component(obstacleWidth, h2, "img/bottle.png", 1500, 0, "image");
    obstacles.push(obstacle);
  }
  updateObstacles();
  myScore.render();
  highScore.render();
  myCharacter.update();
  checkCollision();
}

function jump() {
  myCharacter.speedJump = jumpSpeed;
  myCharacter.speedY = jumpSpeed;
  jumpSound.play();
}

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}