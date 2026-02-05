const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.static('public'));

const DB_PATH = './data/database.json';

// Cargar Base de Datos
const getDB = () => JSON.parse(fs.readFileSync(DB_PATH));
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// --- LÓGICA DE APUESTAS ---
io.on('connection', (socket) => {
    socket.on('joinBattle', ({ userId, betAmount }) => {
        const db = getDB();
        const user = db.users.find(u => u.id === userId);

        if (user && user.balance >= betAmount) {
            user.balance -= betAmount; // Se retira la apuesta al entrar
            saveDB(db);
            socket.emit('betConfirmed', { newBalance: user.balance });
            console.log(`Jugador ${userId} apostó ${betAmount}`);
        } else {
            socket.emit('error', 'Saldo insuficiente para esta arena');
        }
    });

    // Aquí procesamos los clics y las explosiones (Masa Crítica)
    socket.on('placeAtom', (data) => {
        // Lógica de reacción en cadena...
        // Si alguien gana, el servidor le suma el premio (ej: apuesta x 1.8)
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('🚀 COLOR WARS PRO: Online en puerto 3000');
});
