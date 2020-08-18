const { collision } = require("./collisions");
const { createObjectInfo } = require("./object");
const RegularPolygon = require("./object/RegularPolygon");
const e = require("express");

module.exports = class Game {

    constructor(loopCallback) {
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

    getData() {
        return {
            objects: this.objects.map(e => e.getData()),
            particles: this.particles.map(e => e.getData())
        };
    }

    /**
     * Spawns an object.
     * @param {*} object 
     * @param {boolean} [randomLocation] - Spawn in random location.
     * @param {number} [range] - Range of random location.
     */
    spawn(object, randomLocation, range = 1000) {
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
            this.spawn(new RegularPolygon(createObjectInfo({
                radius: randomRadius,
                color: colors[randomVertices % colors.length],
                team: 'obstacle',
                health: randomRadius * 5,
                maxHealth: randomRadius * 5
            }), randomVertices), true);
        }
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
                object.rotate = object.control.rotate;
                object.weapon.fire(object.control.firing);
                if (object.control.moving)
                    object.move(object.control.movingDirection, deltaTime);
                else object.stop();
            }
            object.update(deltaTime, this);
            // collision detection
            this.objects.forEach(otherObject => {
                if (otherObject !== object && collision(object, otherObject))
                    object.collide(otherObject);
            });
            if (object.removed)
                this.spawnParticle(object);
            return !object.removed;
        });
    }

}
