const Tank = require('./game/object/Tank');

const clients = [];

let countdown = 0;
let countdownInterval = false;

class Client {

    constructor(socket, game) {
        this.socket = socket;
        this.game = game;
        this.clientIndex = clients.length;

        this.socket.on('spawnPlayer', () => this.spawnPlayerObject());

        this.socket.on('setName', data => {
            if (game.gameStarted || !data || typeof data !== 'string' || data === 'spectator') return;
            this.name = data.slice(0, 20);
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
            if (data && typeof data === 'string' && this.player && this.player.name) {
                this.socket.broadcast.emit('chat', `${this.player.name}: ${data.slice(0, 50)}`);
                this.socket.emit('chat', `${this.player.name}: ${data.slice(0, 50)}`);
            }
        });

        this.socket.on('disconnect', () => {
            if (this.player) {
                this.player.removed = true;
                if (this.player.name) socket.broadcast.emit('gameAlert', this.player.name + ' left');
                if (this.game.deathSocketUpdate().length < 2 && countdownInterval) {
                    clearInterval(countdownInterval);
                    countdownInterval = false;
                    countdown = -10;
                    this.socket.broadcast.emit('stopCountdown');
                }
            }
            clients.splice(this.clientIndex, 1);
        });
    }

    spawnPlayerObject(startGame) {
        if (this.game.gameStarted) {
            this.socket.emit('gameAlert', 'Game is in progress. You can join the game when it ends.');
            return;
        }
        if (!this.name) return;
        if (this.player) this.player.removed = true;
        this.player = new Tank({ name: this.name });
        this.socket.emit('playerId', this.game.spawn(this.player, true, false, this.game.borderRadius / 2));

        const alivePlayers = this.game.deathSocketUpdate();
        if (alivePlayers.length > 1 && !countdownInterval) {
            countdown = 60;
            countdownInterval = setInterval(() => {
                countdown--;
                if (countdown < 0) {
                    this.game.init();
                    alivePlayers.forEach(c => c.spawnPlayerObject(true));
                    this.game.gameStarted = countdown > -10;
                    clearInterval(countdownInterval);
                    countdownInterval = false;
                    countdown = 0;
                }
            }, 1000);
            this.socket.broadcast.emit('startCountdown', countdown);
        }
        if (countdown > 0) this.socket.emit('startCountdown', countdown);
        else if (!startGame) this.socket.emit('gameAlert', 'Game has not started yet... Waiting for players to join.');
    }

}

module.exports = game => socket => clients.push(new Client(socket, game));

module.exports.clients = clients;