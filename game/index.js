const { collision, circleInCircle } = require("./collisions");
const RegularPolygon = require("./object/RegularPolygon");
const WeaponBall = require('./object/WeaponBall');
const HealBall = require('./object/HealBall');
const ShieldBall = require('./object/ShieldBall');

module.exports = class Game {

    constructor(loopCallback, eventCallback) {
        // render
        this.backgroundColor = 'white';
        this.gridColor = 'lightgrey';
        this.gridWidth = 1;
        this.gridSize = 10;

        // game
        this.nextObjectId = 1;
        this.spawnList = [];
        this.objects = [];
        this.particles = [];
        this.borderRadius = 2000;
        this.borderSpeed = 0.1;

        this.startTime = Date.now();
        this.interval = setInterval(() => this.loop(), 1000 / 60);
        this.loopCallback = loopCallback;
        this.eventCallback = eventCallback;
    }

    loop() {
        const now = Date.now();
        const deltaTime = (now - this.startTime) / 1000;
        this.startTime = now;
        this.update(deltaTime, this);
        this.loopCallback(deltaTime);
    }

    stop() {
        clearInterval(this.interval);
    }

    getData(minimal) {
        const mapFunction = minimal ? e => e.getData() : e => e.getInfo();
        return { br: this.borderRadius, objects: this.objects.map(mapFunction), min: minimal };
    }

    /**
     * Spawns an object.
     * @param {*} object 
     * @param {boolean} [randomLocation] - Spawn in random location.
     * @param {number} [range] - Range of random location.
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

    spawnParticle(particle) {
        particle.renderHealthBar = false;
        particle.alpha = 1;
        this.particles.push(particle);
    }

    /**
     * Spawns obstacles.
     * @param {number} [count] - Number of obstacles.
     * @param {{min: number, max: number}} [vertices] - Range of random vertices.
     * @param {{min: number, max: number}} [radius] - Range of random radius.
     */
    spawnObstacles(count = 50, vertices = { min: 3, max: 5 }, radius = { min: 5, max: 100 }) {
        const colors = ['#dd8800ff', '#ffff99ff', '#0066ffff'];
        for (let i = 0; i < count; i++) {
            const randomRadius = Math.round(Math.random() * (radius.max - radius.min) + radius.min);
            const randomVertices = Math.round(Math.random() * (vertices.max - vertices.min) + vertices.min);
            this.spawn(new RegularPolygon({
                vertices: randomVertices,
                radius: randomRadius,
                color: colors[randomVertices % colors.length],
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
    spawnBalls(count = 25) {
        for (let i = 0; i < count; i++)
            this.spawn(new WeaponBall(), true, this.borderRadius / 2);
        for (let i = 0; i < count; i++)
            this.spawn(new HealBall(), true, this.borderRadius / 2);
        for (let i = 0; i < count; i++)
            this.spawn(new ShieldBall(), true), this.borderRadius / 2;
    }

    update(deltaTime) {
        // update particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime, this);
            particle.alpha -= deltaTime * 20;
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
            const objShape = object.getShape();

            // collision detection
            this.objects.forEach(otherObject => {
                if (otherObject !== object && collision(objShape, otherObject.getShape())) {
                    object.collide(otherObject);
                    if (object.health <= 0 && object.name) {
                        this.eventCallback('killAlert', {
                            killed: object.name,
                            killedId: object.objectId,
                            killedBy: otherObject.name || otherObject.ownerName
                        });
                    }
                }
            });
            // border
            if (!circleInCircle(objShape, { x: 0, y: 0, radius: this.borderRadius })) {
                const dir = Math.atan2(-object.y, -object.x);
                object.addForce({ x: Math.cos(dir) * 500, y: Math.sin(dir) * 500 });
                object.health -= 10;
                if (object.health <= 0 || !object.name) {
                    object.removed = true;
                    if (object.name) this.eventCallback('killAlert', {
                        killed: object.name,
                        killedId: object.objectId
                    });
                }
            }
            if (object.removed)
                this.spawnParticle(object);
            return !object.removed;
        });

        if (this.borderRadius > 100) {
            this.borderRadius -= this.borderSpeed;
        }
    }

}
