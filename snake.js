const btn_start = document.getElementById('btn-start');
const btn_playAgain = document.getElementById('btn-playAgain');
const startGame_gif = document.getElementById('startGame-gif');

// controls
const btn_left = document.getElementById('btn-left');
const btn_up = document.getElementById('btn-up');
const btn_right = document.getElementById('btn-right');
const btn_down = document.getElementById('btn-down');

const controls_container = document.getElementById('controls-container');

btn_playAgain.style.display = 'none';

// const sound = require('./sound')
function sound(src) {
  this.sound = document.createElement('audio');
  this.sound.src = src;
  this.sound.setAttribute('preload', 'auto');
  this.sound.setAttribute('controls', 'none');
  this.sound.style.display = 'none';
  document.body.appendChild(this.sound);
  this.play = function () {
    this.sound.play();
  };
  this.stop = function () {
    this.sound.pause();
  };
}

// Reglas del juego
// Continuidad del juego
// Imprimir el nuevo estado del juego

class Game {
  snake = [];
  food = null;
  eating = false;
  time_ms = 300;
  director = null;
  direction = 2;
  sizeSquare = 10;
  canvas = null;
  txtButton = null;
  txtState = null;

  // controls
  btn_left = null;
  btn_up = null;
  btn_right = null;
  btn_down = null;

  snake_head = new Image();
  snake_body = new Image();
  snake_food = new Image();
  lost_img = new Image();

  bip = new sound('assets/audio/bip.mp3');
  sound_game_over = new sound('assets/audio/game-over-1.mp3');

  isLost = false;
  directions = ['', 'arriba', 'derecha', 'abajo', 'izquierda'];

  constructor(canvas) {
    // this.txtButton = txtButton
    // this.txtState = txtState
    this.canvas = canvas;

    this.btn_left = btn_left;
    this.btn_up = btn_up;
    this.btn_right = btn_right;
    this.btn_down = btn_down;

    this.ctx = this.canvas.getContext('2d');

    this.snake_head.src = 'assets/imgs/cabeza.png';
    this.snake_food.src = 'assets/imgs/comida.png';
    this.snake_body.src = 'assets/imgs/cuerpo.png';
    this.lost_img.src = 'assets/imgs/perdiste.png';
  }

  registerKey() {
    // funcionalidad para teclas [ W, A, S ,D ]
    document.addEventListener('keypress', (e) => {
      // this.printKey(e.key)
      switch (e.key) {
        case 'w' || 'W':
          if (this.direction !== 3) this.direction = 1;
          break;

        case 'd' || 'D':
          if (this.direction !== 4) this.direction = 2;
          break;

        case 's' || 'S':
          if (this.direction !== 1) this.direction = 3;
          break;

        case 'a' || 'A':
          if (this.direction !== 2) this.direction = 4;
          break;
      }
    });

    // funcionalidad para botones en la pantalla ( patalla para celular )
    // left button
    // btn_left.addEventListener('click', () => {
    //   console.log('click')
    // })
  }

  init() {
    let square = new Object();
    square.X = 15;
    square.Y = 15;
    square.X_old = 15;
    square.Y_old = 15;
    this.snake.push(square);

    this.registerKey();

    this.director = setInterval(() => {
      this.rules();
      if (!this.isLost) {
        this.next();
        this.show();
        btn_playAgain.style.display = 'none';
      } else {
        clearInterval(this.director);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.lost_img, 0, 0);
        btn_playAgain.style.display = 'block';
      }
    }, this.time_ms);
  }

  next() {
    // this.printDirection()

    if (this.food === null) {
      this.getFood();
    }

    this.snake.map((square) => {
      square.X_old = square.X;
      square.Y_old = square.Y;
    });

    switch (this.direction) {
      case 1:
        this.snake[0].Y--;
        break;
      case 2:
        this.snake[0].X++;
        break;
      case 3:
        this.snake[0].Y++;
        break;
      case 4:
        this.snake[0].X--;
        break;
    }

    this.snake.map((square, index, snake_) => {
      if (index !== 0) {
        square.X = snake_[index - 1].X_old;
        square.Y = snake_[index - 1].Y_old;
      }
    });

    if (this.food !== null) {
      this.isEating();
    }
  }

  show() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.snake.map((square, index) => {
      if (index === 0) {
        this.ctx.drawImage(
          this.snake_head,
          square.X * this.sizeSquare,
          square.Y * this.sizeSquare
        );
      } else {
        this.ctx.drawImage(
          this.snake_body,
          square.X * this.sizeSquare,
          square.Y * this.sizeSquare
        );
      }

      if (this.food !== null) {
        this.ctx.drawImage(
          this.snake_food,
          this.food.X * this.sizeSquare,
          this.food.Y * this.sizeSquare
        );
      }
    });
  }

  rules() {
    // regla 1: colisión
    for (let j = 0; j < this.snake.length; j++) {
      for (let i = 0; i < this.snake.length; i++) {
        if (j !== i) {
          if (
            this.snake[j].X === this.snake[i].X &&
            this.snake[j].Y === this.snake[i].Y
          ) {
            this.isLost = true;
            // sonido de que perdió
            this.sound_game_over.play();
          }
        }
      }
    }

    // regla 2: sale de la pantalla
    if (
      this.snake[0].X >= 30 ||
      this.snake[0].X < 0 ||
      this.snake[0].Y >= 30 ||
      this.snake[0].Y < 0
    ) {
      this.isLost = true;
      // sonido de que perdió
      this.sound_game_over.play();
    }
  }

  isEating() {
    if (this.snake[0].X === this.food.X && this.snake[0].Y === this.food.Y) {
      this.eating = true;
      this.food = null;
      this.bip.play();
      this.goFaster(this.time_ms);

      let square = new Object();
      square.X = this.snake[this.snake.length - 1].X_old;
      square.Y = this.snake[this.snake.length - 1].Y_old;

      this.snake.push(square);

      // this.time -= 100
      // console.log(this.time)
    }
  }

  getFood() {
    let square = new Object();
    square.X = Math.floor(Math.random() * 30);
    square.Y = Math.floor(Math.random() * 30);
    this.food = square;
  }

  printDirection() {
    this.txtState.value = this.directions[this.direction];
  }

  // printKey(text) {
  //   this.txtButton.value = text
  // }

  // reiniciar juego
  reStartGame() {
    this.snake = [];
    this.food = null;
    this.direction = 2;
    this.isLost = false;
    this.time = 500;
    this.ctx.reset();
  }

  time(time) {
    if (!time) n_time = time_ms;
    this.n_time = time - 100;
  }

  goFaster(time_ms) {
    // cada vez que coma incrementara el tiempo en 5ms
    if (time_ms <= 300) this.time_ms = time_ms - 5;
    if (time_ms <= 200) this.time_ms = time_ms - 1;
    if (time_ms <= 100) this.time_ms = time_ms - 0.3;
    this.time_ms = time_ms - 8;

    clearInterval(this.director);

    this.director = setInterval(() => {
      this.rules();
      if (!this.isLost) {
        this.next();
        this.show();
        btn_playAgain.style.display = 'none';
      } else {
        clearInterval(this.director);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.lost_img, 0, 0);
        btn_playAgain.style.display = 'block';
      }
    }, this.time_ms);

    console.log(this.time_ms);
  }

  goLeft() {
    if (this.direction !== 2) this.direction = 4;
  }
  goUp() {
    if (this.direction !== 3) this.direction = 1;
  }
  goRight() {
    if (this.direction !== 4) this.direction = 2;
  }
  goDown() {
    if (this.direction !== 1) this.direction = 3;
  }
}

let game = new Game(document.getElementById('canvas'));
// document.getElementById('txtButton'),
// document.getElementById('txtState'),

function startGame() {
  game.init();
  btn_start.style.display = 'none';
  startGame_gif.style.display = 'none';
}

function reStartGame() {
  game.reStartGame();
  game.init();
}

// controles para pantalla de celular
// funciones
function handleLeft() {
  game.goLeft();
}
function handleUp() {
  game.goUp();
}
function handleRight() {
  game.goRight();
}
function handleDown() {
  game.goDown();
}

// eventos
btn_left.addEventListener('click', handleLeft);
btn_up.addEventListener('click', handleUp);
btn_right.addEventListener('click', handleRight);
btn_down.addEventListener('click', handleDown);

btn_start.addEventListener('click', startGame);
btn_playAgain.addEventListener('click', reStartGame);

// -----------------------------------------
// Registrar keys de las flechas del teclado
// function showKeyPressed(e) {
//   console.log(e.keyCode)
// }

// document.addEventListener('keypress', (e) => showKeyPressed(e))
