const GRID_SIZE = 16;
const INITIAL_DIRECTION = "right";
const TICK_MS = 140;
const HIGHSCORES_KEY = "snake-highscores";

const directionVectors = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const oppositeDirections = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const board = document.querySelector("#board");
const score = document.querySelector("#score");
const status = document.querySelector("#status");
const errorStatus = document.querySelector("#errorStatus");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const controlButtons = document.querySelectorAll("[data-direction]");
const highscoresList = document.querySelector("#highscoresList");

let state;
let tickId = null;
let highscores = loadHighscores();

try {
  if (
    !board ||
    !score ||
    !status ||
    !errorStatus ||
    !startButton ||
    !restartButton ||
    !highscoresList
  ) {
    throw new Error("Snake UI elements are missing.");
  }

  state = createInitialState();
  buildBoard();
  render();
  renderHighscores();

  window.addEventListener("keydown", handleKeydown);
  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", restartGame);
  controlButtons.forEach((button) => {
    button.addEventListener("click", () => {
      turnSnake(button.dataset.direction);
    });
  });
} catch (error) {
  showError(error);
}

function createInitialSnake() {
  return [
    { x: 2, y: 8 },
    { x: 1, y: 8 },
    { x: 0, y: 8 },
  ];
}

function createInitialState(random = Math.random) {
  const snake = createInitialSnake();

  return {
    gridSize: GRID_SIZE,
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: spawnFood(snake, GRID_SIZE, random),
    score: 0,
    status: "idle",
  };
}

function queueDirection(currentDirection, nextDirection) {
  if (!directionVectors[nextDirection]) {
    return currentDirection;
  }

  if (oppositeDirections[currentDirection] === nextDirection) {
    return currentDirection;
  }

  return nextDirection;
}

function stepGame(currentState, random = Math.random) {
  if (currentState.status === "game-over") {
    return currentState;
  }

  const direction = currentState.pendingDirection;
  const head = currentState.snake[0];
  const vector = directionVectors[direction];
  const nextHead = wrapPosition(
    { x: head.x + vector.x, y: head.y + vector.y },
    currentState.gridSize
  );
  const willGrow = positionsEqual(nextHead, currentState.food);
  const nextSnake = [nextHead, ...currentState.snake];

  if (!willGrow) {
    nextSnake.pop();
  }

  if (hitsSelf(nextHead, nextSnake)) {
    return {
      ...currentState,
      direction,
      pendingDirection: direction,
      status: "game-over",
    };
  }

  return {
    ...currentState,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: willGrow
      ? spawnFood(nextSnake, currentState.gridSize, random)
      : currentState.food,
    score: willGrow ? currentState.score + 1 : currentState.score,
    status: "running",
  };
}

function spawnFood(snake, gridSize, random = Math.random) {
  const occupied = new Set(snake.map(toKey));
  const available = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = toKey({ x, y });
      if (!occupied.has(key)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(random() * available.length);
  return available[index];
}

function positionsEqual(a, b) {
  return Boolean(a && b) && a.x === b.x && a.y === b.y;
}

function hitsSelf(head, snake) {
  return snake.slice(1).some((segment) => positionsEqual(segment, head));
}

function wrapPosition(position, gridSize) {
  return {
    x: (position.x + gridSize) % gridSize,
    y: (position.y + gridSize) % gridSize,
  };
}

function toKey(position) {
  return `${position.x},${position.y}`;
}

function buildBoard() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    fragment.appendChild(cell);
  }

  board.replaceChildren(fragment);
}

function render() {
  const snakeCells = new Set(state.snake.map(toKey));
  const foodKey = state.food ? toKey(state.food) : null;

  Array.from(board.children).forEach((cell, index) => {
    const x = index % GRID_SIZE;
    const y = Math.floor(index / GRID_SIZE);
    const key = `${x},${y}`;

    cell.className = "cell";

    if (snakeCells.has(key)) {
      cell.classList.add("snake");
    } else if (foodKey === key) {
      cell.classList.add("food");
    }
  });

  score.textContent = String(state.score);
  status.textContent = getStatusText();
}

function getStatusText() {
  if (state.status === "idle") {
    return "Press Start, use the on-screen buttons, or use arrow keys/WASD.";
  }

  if (state.status === "game-over") {
    return "Game over. You hit yourself. Press Restart to play again.";
  }

  return "Collect food, wrap through walls, and avoid hitting yourself.";
}

function handleKeydown(event) {
  const direction = mapKeyToDirection(event.key);
  if (!direction) {
    return;
  }

  event.preventDefault();
  turnSnake(direction);
}

function mapKeyToDirection(key) {
  const normalized = key.toLowerCase();

  if (normalized === "arrowup" || normalized === "w") {
    return "up";
  }

  if (normalized === "arrowdown" || normalized === "s") {
    return "down";
  }

  if (normalized === "arrowleft" || normalized === "a") {
    return "left";
  }

  if (normalized === "arrowright" || normalized === "d") {
    return "right";
  }

  return null;
}

function turnSnake(nextDirection) {
  if (state.status === "game-over") {
    return;
  }

  state = {
    ...state,
    pendingDirection: queueDirection(state.direction, nextDirection),
    status: "running",
  };

  ensureTicker();
  board.focus();
  render();
}

function startGame() {
  if (state.status === "game-over") {
    restartGame();
  }

  state = {
    ...state,
    status: "running",
  };

  state = stepGame(state);
  ensureTicker();
  board.focus();
  render();
}

function ensureTicker() {
  if (tickId !== null) {
    return;
  }

  tickId = window.setInterval(() => {
    state = stepGame(state);
    render();

    if (state.status === "game-over") {
      saveHighscore(state.score);
      window.clearInterval(tickId);
      tickId = null;
    }
  }, TICK_MS);
}

function restartGame() {
  if (tickId !== null) {
    window.clearInterval(tickId);
    tickId = null;
  }

  state = createInitialState();
  board.focus();
  render();
}

function showError(error) {
  console.error(error);

  if (errorStatus) {
    errorStatus.hidden = false;
    errorStatus.textContent =
      "Spillet kunne ikke starte. Last siden pa nytt og prov igjen.";
  }

  if (status) {
    status.textContent = "JavaScript-feil under oppstart.";
  }
}

function loadHighscores() {
  try {
    const saved = window.localStorage.getItem(HIGHSCORES_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value) => Number.isFinite(value)).slice(0, 3);
  } catch (error) {
    console.error(error);
    return [];
  }
}

function saveHighscore(nextScore) {
  if (!Number.isFinite(nextScore) || nextScore < 0) {
    return;
  }

  highscores = [...highscores, nextScore]
    .sort((left, right) => right - left)
    .slice(0, 3);

  try {
    window.localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(highscores));
  } catch (error) {
    console.error(error);
  }

  renderHighscores();
}

function renderHighscores() {
  const items = Array.from({ length: 3 }, (_, index) => {
    const value = highscores[index];
    if (typeof value === "number") {
      return `<li>${value} poeng</li>`;
    }

    return "<li>Ingen runder ennå</li>";
  });

  highscoresList.innerHTML = items.join("");
}
