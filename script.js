class MatchGrid {
  constructor(args) {
    this.width = args.width || 440;
    this.height = args.height || 440;
    this.columns = args.columns || 4;
    this.rows = args.rows || 4;
    this.timeLimit = args.timeLimit || 60;
    this.theme = args.theme || {
      background: "#eaeccc",
      color: "#b1c381",
    };

    this.remainingTime = this.timeLimit;
    this.timerInterval = null;

    this.initializeGame();
    this.applyStyles();
    this.showStartScreen();
    this.container = document.querySelector(".container");
    this.container.addEventListener(
      "mouseenter",
      this.handleMouseEnter.bind(this)
    );
    this.container.addEventListener(
      "mouseleave",
      this.handleMouseLeave.bind(this)
    );
  }

  handleMouseEnter() {
    if (this.isPaused) {
      this.isPaused = false;
      this.resumeGame();
    }
  }

  handleMouseLeave() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseGame();
    }
  }

  showStartScreen() {
    const startButton = document.querySelector(".start-button");
    const startAgainButton = document.querySelector(".start-again-button");

    if (startButton) {
      startButton.addEventListener("click", () => {
        document.querySelector(".start-screen").style.display = "none";
        document.querySelector(".container").style.display = "flex";
        matchGrid.startTimer();
      });
    }

    if (startAgainButton) {
      startAgainButton.addEventListener("click", () => {
        document.querySelector(".end-screen").style.display = "none";
        document.querySelector(".container").style.display = "none";
        matchGrid.resetGame();

        // Reload the page
        location.reload();
      });
    }
  }

  showEndScreen(isWinner) {
    const endScreen = document.getElementById("end-screen");
    const gameContainer = document.querySelector(".container");

    if (endScreen) {
      const messageElement = document.getElementById("end-message");

      if (messageElement) {
        if (isWinner) {
          messageElement.textContent = "Congratulations! You won!";
        } else {
          messageElement.textContent = "Your time is over. Try again!";
        }
      }

      endScreen.style.display = "block";
      gameContainer.style.display = "none";
    }
  }

  resetGame() {
    // Clear existing game grid
    const gameContainer = document.querySelector(".game");
    if (gameContainer) {
      gameContainer.innerHTML = "";
    }

    // Reset game state
    this.remainingTime = this.timeLimit;
    this.stopTimer();
    this.initializeGame();

    // Delay before starting the timer again
    setTimeout(() => {
      this.startTimer();
    }, 100);

    this.applyStyles();

    // Clear any messages
    const messageElement = document.getElementById("message");
    if (messageElement) {
      messageElement.textContent = "";
    }
  }

  pauseGame() {
    const gameContainer = document.querySelector(".game");
    const timerElement = document.getElementById("timer");

    if (gameContainer) {
      gameContainer.classList.add("paused");
    }

    if (timerElement) {
      clearInterval(this.timerInterval);
      timerElement.textContent = "Game paused";
      timerElement.classList.add("paused");
    }
  }

  resumeGame() {
    const gameContainer = document.querySelector(".game");
    const timerElement = document.getElementById("timer");

    if (gameContainer) {
      gameContainer.classList.remove("paused");
    }

    if (timerElement) {
      this.startTimer();
      timerElement.classList.remove("paused");
    }
  }

  initializeGame() {
    const numbers = this.generateShuffledNumbers();

    // Create the game grid container
    const gridContainer = document.createElement("div");
    gridContainer.className = "grid-container";
    gridContainer.style.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

    // Populate the grid with items
    for (let i = 0; i < numbers.length; i++) {
      let item = document.createElement("div");
      item.className = "item";
      item.innerHTML = numbers[i];

      item.onclick = () => this.handleBoxClick(item);

      gridContainer.appendChild(item);
    }

    document.querySelector(".game").appendChild(gridContainer);
  }

  generateShuffledNumbers() {
    const numbers = [];
    for (let i = 1; i <= (this.columns * this.rows) / 2; i++) {
      numbers.push(i, i);
    }
    return numbers.sort(() => (Math.random() > 0.5 ? 1 : -1));
  }

  handleBoxClick(box) {
    if (
      box.classList.contains("boxMatch") ||
      box.classList.contains("boxOpen")
    ) {
      return;
    }

    box.classList.add("boxOpen");

    setTimeout(() => {
      const openBoxes = document.querySelectorAll(".boxOpen");
      if (openBoxes.length > 1) {
        if (openBoxes[0].innerHTML === openBoxes[1].innerHTML) {
          openBoxes.forEach((openBox) => {
            openBox.classList.remove("boxOpen");
            openBox.classList.add("boxMatch");
            openBox.style.transform = "unset";
          });

          if (
            document.querySelectorAll(".boxMatch").length ===
            this.columns * this.rows
          ) {
            this.stopTimer();
            this.showEndScreen(true);
          }
        } else {
          openBoxes.forEach((openBox) => openBox.classList.remove("boxOpen"));
        }
      }
    }, 500);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.remainingTime === 0) {
        this.stopTimer();
        this.showEndScreen(false);
      } else if (
        document.querySelectorAll(".boxMatch").length ===
        this.columns * this.rows
      ) {
        this.stopTimer();
        this.showEndScreen(true);
      } else {
        this.updateTimerDisplay();
        this.remainingTime--;
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    if (timerElement) {
      timerElement.textContent = `Time: ${this.remainingTime}s`;
    }
  }

  applyStyles() {
    const gameContainer = document.querySelector(".game");
    const timerElement = document.getElementById("timer");
    const containerElement = document.querySelector(".container");

    if (gameContainer) {
      gameContainer.style.width = `${this.width}px`;
      gameContainer.style.height = `${this.height}px`;

      gameContainer.style.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;
      gameContainer.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
    }

    if (timerElement) {
      timerElement.style.color = this.theme.color;

      // Add restarting class to trigger the transition
      timerElement.classList.add("restarting");
      // Remove the restarting class after a short delay
      setTimeout(() => {
        timerElement.classList.remove("restarting");
      }, 1000);
    }

    if (containerElement) {
      containerElement.style.background = this.theme.background;
    }
  }
}

const matchGrid = new MatchGrid({
  width: 440,
  height: 440,
  columns: 4,
  rows: 4,
  timeLimit: 60,
  theme: {
    background: "#FFF7D4",
    color: "#b1c381",
  },
});

const replayButton = document.querySelector(".reset");
if (replayButton) {
  replayButton.addEventListener("click", () => matchGrid.resetGame());
}

//Adding animations from anime.js

let animation = anime({
  targets: ".letter",
  opacity: 1,
  translateY: 50,
  rotate: {
    value: 360,
    duration: 2000,
    easing: "easeInExpo",
  },
  scale: anime.stagger([0.7, 1], { from: "center" }),
  delay: anime.stagger(100, { start: 1000 }),
  translateX: [-10, 30],
});

window.human = false;

var canvasEl = document.querySelector(".fireworks");
var ctx = canvasEl.getContext("2d");
var numberOfParticules = 30;
var pointerX = 0;
var pointerY = 0;
var tap =
  "ontouchstart" in window || navigator.msMaxTouchPoints
    ? "touchstart"
    : "mousedown";
var colors = ["#FF1461", "#18FF92", "#5A87FF", "#FBF38C"];

function setCanvasSize() {
  canvasEl.width = window.innerWidth * 2;
  canvasEl.height = window.innerHeight * 2;
  canvasEl.style.width = window.innerWidth + "px";
  canvasEl.style.height = window.innerHeight + "px";
  canvasEl.getContext("2d").scale(2, 2);
}

function updateCoords(e) {
  pointerX = e.clientX || e.touches[0].clientX;
  pointerY = e.clientY || e.touches[0].clientY;
}

function setParticuleDirection(p) {
  var angle = (anime.random(0, 360) * Math.PI) / 180;
  var value = anime.random(50, 180);
  var radius = [-1, 1][anime.random(0, 1)] * value;
  return {
    x: p.x + radius * Math.cos(angle),
    y: p.y + radius * Math.sin(angle),
  };
}

function createParticule(x, y) {
  var p = {};
  p.x = x;
  p.y = y;
  p.color = colors[anime.random(0, colors.length - 1)];
  p.radius = anime.random(16, 32);
  p.endPos = setParticuleDirection(p);
  p.draw = function () {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = p.color;
    ctx.fill();
  };
  return p;
}

function createCircle(x, y) {
  var p = {};
  p.x = x;
  p.y = y;
  p.color = "#FFF";
  p.radius = 0.1;
  p.alpha = 0.5;
  p.lineWidth = 6;
  p.draw = function () {
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.lineWidth = p.lineWidth;
    ctx.strokeStyle = p.color;
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  return p;
}

function renderParticule(anim) {
  for (var i = 0; i < anim.animatables.length; i++) {
    anim.animatables[i].target.draw();
  }
}

function animateParticules(x, y) {
  var circle = createCircle(x, y);
  var particules = [];
  for (var i = 0; i < numberOfParticules; i++) {
    particules.push(createParticule(x, y));
  }
  anime
    .timeline()
    .add({
      targets: particules,
      x: function (p) {
        return p.endPos.x;
      },
      y: function (p) {
        return p.endPos.y;
      },
      radius: 0.1,
      duration: anime.random(1200, 1800),
      easing: "easeOutExpo",
      update: renderParticule,
    })
    .add({
      targets: circle,
      radius: anime.random(80, 160),
      lineWidth: 0,
      alpha: {
        value: 0,
        easing: "linear",
        duration: anime.random(600, 800),
      },
      duration: anime.random(1200, 1800),
      easing: "easeOutExpo",
      update: renderParticule,
      offset: 0,
    });
}

var render = anime({
  duration: Infinity,
  update: function () {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  },
});

document.addEventListener(
  tap,
  function (e) {
    window.human = true;
    render.play();
    updateCoords(e);
    animateParticules(pointerX, pointerY);
  },
  false
);

var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;

function autoClick() {
  if (window.human) return;
  animateParticules(
    anime.random(centerX - 50, centerX + 50),
    anime.random(centerY - 50, centerY + 50)
  );
  anime({ duration: 200 }).finished.then(autoClick);
}

autoClick();
setCanvasSize();
window.addEventListener("resize", setCanvasSize, false);
