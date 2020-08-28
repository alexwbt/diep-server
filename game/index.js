const { collision, circleInCircle } = require("./collisions");
const RegularPolygon = require("./object/RegularPolygon");
const WeaponBall = require('./object/WeaponBall');
const HealBall = require('./object/HealBall');
const ShieldBall = require('./object/ShieldBall');
const { TANK } = require('./constants');
const GameObject = require("./object");
const { clients } = require("../client");
const Bush = require("./object/Bush");

module.exports = class Game {

    constructor(io) {
        // render
        this.backgroundColor = 'white';
        this.gridColor = 'lightgrey';
        this.gridWidth = 1;
        this.gridSize = 10;

        // gameloop
        this.startTime = Date.now();
        this.interval = setInterval(() => this.gameloop(), 1000 / 60);

        // socket
        this.updateCounter = 0;
        this.io = io;

        this.init();
    }

    init() {
        this.nextObjectId = 1;
        this.spawnList = [];
        this.objects = [];
        this.particles = [];
        this.minBorderRadius = 100;
        this.borderRadius = 2000;
        this.borderSpeed = 0.15;
        this.gameStarted = false;
        this.playerList = [];

        this.spawnObstacles();
        this.spawnBalls();
        this.spawnBushes();
    }

    gameloop() {
        const now = Date.now();
        const deltaTime = (now - this.startTime) / 1000;
        this.startTime = now;
        this.update(deltaTime, this);

        // socket
        this.updateCounter += deltaTime;
        if (this.updateCounter > +process.env.UPDATE) {
            this.updateCounter = 0;
            const data = this.getData(!!process.env.MIN_DATA);
            data && this.io.emit('update', data);
        }
    }

    getData(minimal) {
        const mapFunction = minimal ? e => e.getData() : e => e.getInfo();
        return {
            br: this.borderRadius,
            objects: this.objects.map(mapFunction),
            particles: this.particles.map(mapFunction),
            min: minimal
        };
    }

    /**
     * Spawns an object.
     * @param {*} object 
     * @param {boolean} [randomLocation] - Spawn in random location.
     * @param {number} [range] - Range of random location.
     * @param {number} [minRange] - Minimum range of random location.
     */
    spawn(object, randomLocation, range, minRange = 0) {
        if (!range) range = this.borderRadius - object.radius - 10;
        object.objectId = this.nextObjectId++;
        if (randomLocation) {
            const randomDirection = Math.random() * Math.PI * 2;
            const randomRange = Math.random() * (range - minRange) + minRange;
            object.x = Math.cos(randomDirection) * randomRange;
            object.y = Math.sin(randomDirection) * randomRange;
        }
        this.spawnList.push(object);
        return object.objectId;
    }

    spawnParticle(particle, randomLocation, range, minRange = 0, fadeOverTime = true) {
        if (!range) range = this.borderRadius - particle.radius - 10;
        if (randomLocation) {
            const randomDirection = Math.random() * Math.PI * 2;
            const randomRange = Math.random() * (range - minRange) + minRange;
            particle.x = Math.cos(randomDirection) * randomRange;
            particle.y = Math.sin(randomDirection) * randomRange;
        }
        particle.renderHealthBar = false;
        particle.alpha = 1;
        particle.fadeOverTime = fadeOverTime;
        this.particles.push(particle);
    }

    /**
     * Spawns obstacles.
     * @param {number} [count] - Number of obstacles.
     * @param {{min: number, max: number}} [vertices] - Range of random vertices.
     * @param {{min: number, max: number}} [radius] - Range of random radius.
     */
    spawnObstacles(count = 40, vertices = { min: 3, max: 5 }, radius = { min: 5, max: 100 }) {
        const colors = ['#dd8800ff', '#ffff99ff', '#0066ffff'];
        for (let i = 0; i < count * 0.4; i++) {
            const randomRadius = Math.round(Math.random() * (radius.max - radius.min) + radius.min);
            const randomVertices = Math.round(Math.random() * (vertices.max - vertices.min) + vertices.min);
            this.spawn(new RegularPolygon({
                vertices: randomVertices,
                rotate: Math.random() * 360,
                radius: randomRadius,
                color: colors[randomVertices % colors.length],
                team: -1,
                health: randomRadius * 10,
                maxHealth: randomRadius * 10,
                friction: randomRadius
            }), true);
        }
        for (let i = 0; i < count * 0.6; i++) {
            const randomRadius = Math.round(Math.random() * (radius.max - radius.min) + radius.min);
            this.spawn(new GameObject({
                radius: randomRadius,
                color: '#aabbccff',
                team: -1,
                health: randomRadius * 10,
                maxHealth: randomRadius * 10,
                friction: randomRadius
            }), true);
        }
    }

    /**
     * Spawns balls.
     * @param {number} [count] - Number of balls.
     */
    spawnBalls(count = 30) {
        for (let i = 0; i < count; i++)
            this.spawn(new WeaponBall(), true, this.borderRadius / 2);
        for (let i = 0; i < count; i++)
            this.spawn(new HealBall(), true, this.borderRadius / 2);
        for (let i = 0; i < count; i++)
            this.spawn(new ShieldBall(), true, this.borderRadius / 2);
    }

    spawnBushes(count = 20) {
        for (let i = 0; i < count; i++)
            this.spawnParticle(new Bush(), true, false, 0, false);
    }

    update(deltaTime) {
        // update particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime, this);
            if (particle.fadeOverTime) particle.alpha -= deltaTime * 20;
            return particle.alpha > 0;
        });

        // update objects
        this.objects = this.objects.concat(this.spawnList);
        this.spawnList = [];
        this.objects = this.objects.filter(object => {
            // socket control
            if (object.control) {
                if (object.control.rotate !== object.rotate ||
                    object.control.firing !== object.weapon.firing)
                    object.shouldSendSocket = true;
                object.rotate = object.control.rotate;
                object.weapon.firing = object.control.firing;
                if (object.control.moving)
                    object.move(object.control.movingDirection, deltaTime);
                else object.stop();
            }
            object.update(deltaTime, this);
            // border
            if (!circleInCircle(object, { x: 0, y: 0, radius: this.borderRadius })) {
                switch (object.objectType) {
                    case TANK:
                        object.health -= this.minBorderRadius / this.borderRadius;
                        if (object.health <= 0) {
                            object.removed = true;
                            this.deathSocketUpdate(object);
                        }
                        break;
                    default:
                        const dir = Math.atan2(-object.y, -object.x);
                        object.addForce({ x: Math.cos(dir) * 500, y: Math.sin(dir) * 500 });
                        object.removed = true;
                }
            }
            // collision detection
            this.objects.forEach(otherObject => {
                if (otherObject !== object && collision(object.getShape(), otherObject.getShape())) {
                    object.collide(otherObject);
                    if (!this.gameStarted)
                        object.health = object.maxHealth;
                    if (object.removed && object.name)
                        this.deathSocketUpdate(object, otherObject);
                }
            });
            if (object.removed)
                this.spawnParticle(object);
            return !object.removed;
        });

        if (this.gameStarted && this.borderRadius > this.minBorderRadius) {
            this.borderRadius -= this.borderSpeed;
        }
    }

    deathSocketUpdate(object, otherObject) {
        if (object) {
            if (!object.killCount) object.killCount = 0;
            object.killCount++;
            this.io.emit('killAlert', {
                killed: object.name,
                killedId: object.objectId,
                killedBy: otherObject && (otherObject.name || otherObject.ownerName)
            });
        }

        const alivePlayers = clients.filter(c => c.player && !c.player.removed);
        this.io.emit('alivePlayers', alivePlayers.map(c => ({ name: c.name, kills: c.killCount })));
        if (alivePlayers.length === 1 && this.gameStarted) {
            this.io.emit('gameEnded', { winner: alivePlayers[0].name });
            this.gameStarted = false;
            setTimeout(() => this.init(), 100);
        }
        return alivePlayers;
    }

}
