const Tank = require('./game/object/Tank');

const clients = [];

class Client {

    constructor(socket, game) {
        this.socket = socket;
        this.game = game;
        this.clientIndex = clients.length;

        this.socket.on('spawnPlayer', this.spawnPlayerObject.bind(this));

        this.socket.on('setName', data => {
            if (game.gameStarted || !data || typeof data !== 'string') return;
            this.name = data.slice(0, 10);
            if (!this.player) this.spawnPlayerObject();
            else this.player.name = this.name;
            this.socket.broadcast.emit('gameAlert', this.name + ' joined');
        });

        this.socket.on('update', data => {
            if (!this.player || !this.player.name) return;
            if (this.player && data) this.player.control = {
                rotate: typeof data.rotate === 'number' ? data.rotate : 0,
                firing: typeof data.firing === 'boolean' && data.firing,
                moving: typeof data.moving === 'boolean' && data.moving,
                movingDirection: typeof data.movingDirection === 'number' ? data.movingDirection : 0
            };
            this.socket.broadcast.emit('playerRotate', [this.player.objectId, this.player.control.rotate]);
        });

        if (!!process.env.MIN_DATA)
            this.socket.on('initialUpdate', () => this.socket.emit('update', this.game.getData()));

        this.socket.on('chat', data => {
            if (data && typeof data === 'string') {
                this.socket.broadcast.emit('chat', `${this.player.name}: ${data.slice(0, 50)}`);
                this.socket.emit('chat', `${this.player.name}: ${data.slice(0, 50)}`);
            }
        });

        this.socket.on('disconnect', () => {
            if (this.player) {
                this.player.removed = true;
                if (this.player.name) socket.broadcast.emit('gameAlert', this.player.name + ' left');
            }
            clients.splice(this.clientIndex, 1);
        });
    }

    spawnPlayerObject() {
        if (this.game.gameStarted || !this.name) return;
        if (this.player) this.player.removed = true;
        this.player = new Tank({ name: this.name });
        this.socket.emit('playerId', this.game.spawn(this.player, true, false, this.game.borderRadius / 2));
    }

}

let countdown;
let countdownInterval;
module.exports = game => socket => {
    // if (clients.length < 2 && !countdownInterval && !game.gameStarted) {
    //     countdown = 30;
    //     countdownInterval = setInterval(() => {
    //         countdown--;
    //         if (countdown < 0) {
    //             game.init();
    //             clients.forEach(c => c.spawnPlayerObject());
    //             game.gameStarted = true;
    //             clearInterval(countdownInterval);
    //             countdownInterval = false;
    //         }
    //     }, 1000);
    // }
    // if (countdown > 0) socket.emit('startCountdown', countdown);
    // else socket.emit('gameAlert', 'Game has not started yet');
    game.gameStarted = true;
    clients.push(new Client(socket, game));
};

module.exports.playerKillUpdate = io => {
    const alivePlayers = clients.filter(c => c.player && !c.player.removed);
    io.emit('alivePlayers', alivePlayers.map(c => c.name));
    if (alivePlayers.length === 0) {
        io.emit('gameEnded', {

        });
    }
};
