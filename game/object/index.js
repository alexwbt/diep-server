const { collision } = require("../collisions");
const { different } = require("../maths");

const createObjectInfo = info => ({
    x: 0,
    y: 0,
    radius: 10,
    rotate: 0,
    shape: 'circle',

    // render
    color: '#0af',
    alpha: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0.1,
    renderOnMap: true,
    healthColor: 'rgba(0, 255, 0, 0.5)',
    healthBarColor: 'rgba(0, 0, 0, 0.5)',
    renderHealthBar: true,

    // game
    team: 'self',
    health: 100,
    maxHealth: 100,
    bodyDamage: 1,

    // movement
    movingDirection: 0,
    movingSpeed: 0,
    forces: [],
    momentum: { x: 0, y: 0 },
    friction: 5,

    ...info
});

module.exports = class GameObject {

    constructor(info) {
        this.setData(info);
    }

    getData() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            rotate: this.rotate,
            shape: this.shape,

            // render
            color: this.color,
            alpha: this.alpha,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth,
            renderOnMap: this.renderOnMap,
            healthColor: this.healthColor,
            healthBarColor: this.healthBarColor,
            renderHealthBar: this.renderHealthBar,
            name: this.name,

            // game
            team: this.team,
            health: this.health,
            maxHealth: this.maxHealth,
            bodyDamage: this.bodyDamage,

            // movement
            movingDirection: this.movingDirection,
            movingSpeed: this.movingSpeed,
            forces: this.forces,
            momentum: this.momentum,
            friction: this.friction,
            objectId: this.objectId,
            objectType: 'Object'
        };
    }

    setData(data) {
        this.x = data.x;
        this.y = data.y;
        this.radius = data.radius;
        this.rotate = data.rotate;
        this.shape = data.shape;
        this.objectId = data.objectId;

        // render
        this.color = data.color;
        this.alpha = data.alpha;
        this.borderColor = data.borderColor;
        this.borderWidth = data.borderWidth;
        this.renderOnMap = data.renderOnMap;
        this.healthColor = data.healthColor;
        this.healthBarColor = data.healthBarColor;
        this.renderHealthBar = data.renderHealthBar;
        this.name = data.name;

        // game
        this.team = data.team;
        this.health = data.health;
        this.maxHealth = data.maxHealth;
        this.bodyDamage = data.bodyDamage;

        // movement
        this.movingDirection = data.movingDirection;
        this.movingSpeed = data.movingSpeed;
        this.forces = data.forces;
        this.momentum = data.momentum;
        this.friction = data.friction;
    }

    getName() {
        return this.name;
    }

    /**
     * Add a force to the object.
     * @param {{x: number, y: number}} force 
     */
    addForce(force) {
        this.forces.push(force);
    }

    differentTeam(otherObject) {
        return this.team !== otherObject.team || this.team === 'self';
    }

    collide(otherObject) {
        const dif = different(otherObject, this);
        this.addForce({
            x: dif.x,
            y: dif.y
        });

        if (this.differentTeam(otherObject) && otherObject.differentTeam(this)) {
            this.health -= otherObject.bodyDamage;
            if (this.health <= 0) this.removed = true;
            else this.alpha = 0.5;
        }
    }

    update(deltaTime) {
        this.forces.forEach(force => {
            this.momentum.x += force.x;
            this.momentum.y += force.y;
        });
        this.forces = [];
        this.x += this.momentum.x * deltaTime;
        this.y += this.momentum.y * deltaTime;
        if (Math.abs(this.momentum.x) < 0.001) this.momentum.x = 0;
        else this.momentum.x *= Math.pow(Math.E, -this.friction * deltaTime);
        if (Math.abs(this.momentum.y) < 0.001) this.momentum.y = 0;
        else this.momentum.y *= Math.pow(Math.E, -this.friction * deltaTime);

        this.x += Math.cos(this.movingDirection) * this.movingSpeed * deltaTime;
        this.y += Math.sin(this.movingDirection) * this.movingSpeed * deltaTime;

        if (this.alpha < 1) this.alpha += deltaTime * 10;
        else this.alpha = 1;
    }

}

module.exports.createObjectInfo = createObjectInfo;
