const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Game = require('./game');
const Tank = require('./game/object/Tank');
const { createTankInfo } = Tank;

let updateCounter = 0;
const game = new Game((deltaTime) => {
    updateCounter += deltaTime;
    if (updateCounter > 0.5) {
        updateCounter = 0;
        io.emit('update', game.getData());
    }
});

io.on('connection', (socket) => {
    let player;
    socket.on('setName', data => {
        player = new Tank(createTankInfo());
        socket.emit('playerId', game.spawn(player, true));
    });

    socket.on('update', data => {
        if (player) player.control = data;
    });

    socket.on('chat', data => {
        io.emit('chat', data);
    });

    socket.on('disconnect', () => {

    });
    socket.emit('gameAlert', 'welcome');
});

http.listen(5000, () => {
    console.log('Server started on port 5000.');
});
