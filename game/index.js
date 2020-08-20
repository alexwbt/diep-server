const { collision } = require("./collisions");
const RegularPolygon = require("./object/RegularPolygon");
const WeaponBall = require('./object/WeaponBall');

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
        if (minimal) {
            const data = { objects: [], objectIds: [] };
            for (let i = 0; i < this.objects.length; i++)
                if (this.objects[i].shouldSendSocket) {
                    data.objects.push(this.objects[i].getData());
                    this.objects[i].shouldSendSocket = false;
                } else data.objectIds.push(this.objects[i].objectId);
            return data.objects.length > 0 && data;
        }
        return { objects: this.objects.map(e => e.getData()) };
    }

    /**
     * Spawns an object.
     * @param {*} object 
     * @param {boolean} [randomLocation] - Spawn in random location.
     * @param {number} [range] - Range of random location.
     */
    spawn(object, randomLocation, range = 1500) {
        object.objectId = this.nextObjectId++;
        if (randomLocation) {
            object.x = Math.random() * range - range / 2;
            object.y = Math.random() * range - range / 2;
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
    spawnObstacles(count = 50, vertices = { min: 3, max: 5 }, radius = { min: 5, max: 20 }) {
        const colors = ['orange', '#FF9', '#06f'];
        for (let i = 0; i < count; i++) {
            const randomRadius = Math.random() * (radius.max - radius.min) + radius.min;
            const randomVertices = Math.round(Math.random() * (vertices.max - vertices.min) + vertices.min);
            this.spawn(new RegularPolygon({
                radius: randomRadius,
                color: colors[randomVertices % colors.length],
                team: 'obstacle',
                health: randomRadius * 5,
                maxHealth: randomRadius * 5
            }, randomVertices), true);
        }
    }

    /**
     * Spawns weapon balls.
     * @param {number} [count] - Number of weapon ball.
     */
    spawnWeaponBalls(count = 20) {
        for (let i = 0; i < count; i++)
            this.spawn(new WeaponBall(), true);
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
                object.weapon.fire(object.control.firing);
                if (object.control.moving)
                    object.move(object.control.movingDirection, deltaTime);
                else object.stop();
            }
            object.update(deltaTime, this);
            // collision detection
            this.objects.forEach(otherObject => {
                if (otherObject !== object && collision(object, otherObject)) {
                    object.collide(otherObject);
                    if (object.health <= 0 && object.name) {
                        this.eventCallback('killAlert', {
                            killed: object.name,
                            killedId: object.objectId,
                            killedBy: otherObject.getName(this)
                        })
                    }
                }
            });
            if (object.removed)
                this.spawnParticle(object);
            return !object.removed;
        });
    }

}
