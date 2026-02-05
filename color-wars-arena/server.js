const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const SIZE = 6;
let players = [];
let turn = 0;

function createBoard() {
  const board = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const isCorner = (r === 0 || r === 5) && (c === 0 || c === 5);
      const isEdge = r === 0 || r === 5 || c === 0 || c === 5;
      const limit = isCorner ? 2 : isEdge ? 3 : 4;
      board.push({ atoms: 0, owner: null, limit });
    }
  }
  return board;
}

let board = createBoard();

function explode(index, owner) {
  const queue = [index];

  while (queue.length) {
    const i = queue.shift();
    const cell = board[i];
    if (cell.atoms < cell.limit) continue;

    cell.atoms = 0;
    cell.owner = null;

    const r = Math.floor(i / SIZE);
    const c = i % SIZE;

    const neighbors = [];
    if (r > 0) neighbors.push(i - SIZE);
    if (r < SIZE - 1) neighbors.push(i + SIZE);
    if (c > 0) neighbors.push(i - 1);
    if (c < SIZE - 1) neighbors.push(i + 1);

    for (const n of neighbors) {
      board[n].atoms++;
      board[n].owner = owner;
      if (board[n].atoms >= board[n].limit) queue.push(n);
    }
  }
}

io.on("connection", socket => {

  // SOLO PERMITIR 2 JUGADORES
  if (players.length >= 2) {
    socket.disconnect();
    return;
  }

  const color = players.length === 0 ? "blue" : "red";
  players.push({ id: socket.id, color });

  socket.emit("init", { color });
  io.emit("state", { board, turn });

  socket.on("move", index => {

    // 🔒 BLOQUEO TOTAL DE ERRORES
    if (players.length < 2) return;
    if (!players[turn]) return;
    if (players[turn].id !== socket.id) return;

    const cell = board[index];

    if (cell.owner && cell.owner !== players[turn].color) return;

    cell.atoms++;
    cell.owner = players[turn].color;

    if (cell.atoms >= cell.limit) {
      explode(index, players[turn].color);
    }

    turn = (turn + 1) % 2;
    io.emit("state", { board, turn });
  });

  socket.on("disconnect", () => {
    players = [];
    board = createBoard();
    turn = 0;
    io.emit("state", { board, turn });
  });
});

server.listen(3000, () => {
  console.log("🔥 Color Wars Arena activo en puerto 3000");
});
