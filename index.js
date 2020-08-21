require('dotenv').config();
const { PORT, UPDATE, MIN_DATA } = process.env;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Game = require('./game');
const Tank = require('./game/object/Tank');

let updateCounter = 0;
const game = new Game((deltaTime) => {
    updateCounter += deltaTime;
    if (updateCounter > +UPDATE) {
        updateCounter = 0;
        const data = game.getData(!!MIN_DATA);
        data && io.emit('update', data);
    }
}, (event, data) => {
    io.emit('gameEvent', { event, data });
});
game.spawnObstacles();
game.spawnWeaponBalls();

io.on('connection', (socket) => {
    let player, name;

    const spawnPlayer = () => {
        if (player) player.removed = true;
        player = new Tank({ name });
        socket.emit('playerId', game.spawn(player, true));
    };

    socket.on('spawnPlayer', spawnPlayer);
    socket.on('setName', data => {
        if (!data || typeof data !== 'string') return;
        name = data.slice(0, 10);
        if (!player) spawnPlayer();
        else player.name = name;
        io.emit('gameAlert', name + ' joined');
    });
    socket.on('update', data => {
        if (player && data) player.control = {
            rotate: typeof data.rotate === 'number' ? data.rotate : 0,
            firing: typeof data.firing === 'boolean' && data.firing,
            moving: typeof data.moving === 'boolean' && data.moving,
            movingDirection: typeof data.movingDirection === 'number' ? data.movingDirection : 0
        };
    });
    socket.on('initialUpdate', () => socket.emit('update', game.getData()));
    socket.on('chat', data => { if (data && typeof data === 'string') io.emit('chat', `${player.name}: ${data.slice(0, 50)}`) });
    socket.on('disconnect', () => {
        if (player) {
            player.removed = true
            if (player.name) io.emit('gameAlert', player.name + ' left');
        }
    });
});

http.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`);
});
