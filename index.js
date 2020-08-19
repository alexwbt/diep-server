const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Game = require('./game');
const Tank = require('./game/object/Tank');

let updateCounter = 0;
const game = new Game((deltaTime) => {
    updateCounter += deltaTime;
    if (updateCounter > 0.02) {
        updateCounter = 0;
        io.emit('update', game.getData());
    }
}, (event, data) => {
    io.emit('gameEvent', { event, data });
});
game.spawnObstacles();
game.spawnWeaponBalls();

io.on('connection', (socket) => {
    let player;
    socket.on('setName', data => {
        if (!data || typeof data !== 'string') return;
        if (player) player.removed = true;
        player = new Tank();
        player.name = data.slice(0, 10);
        socket.emit('playerId', game.spawn(player, true));
        io.emit('gameAlert', data + ' joined');
    });
    socket.on('update', data => {
        if (player && data) player.control = {
            rotate: typeof data.rotate === 'number' ? data.rotate : 0,
            firing: typeof data.firing === 'boolean' && data.firing,
            moving: typeof data.moving === 'boolean' && data.moving,
            movingDirection: typeof data.movingDirection === 'number' ? data.movingDirection : 0
        };
    });
    socket.on('chat', data => { if (data && typeof data === 'string') io.emit('chat', `${player.name}: ${data.slice(0, 50)}`) });
    socket.on('disconnect', () => {
        if (player) {
            player.removed = true
            if (player.name) io.emit('gameAlert', player.name + ' left');
        }
    });
    socket.emit('connected');
});

http.listen(5000, () => {
    console.log('Server started on port 5000.');
});
