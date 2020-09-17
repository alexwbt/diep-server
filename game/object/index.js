const { collision } = require("../collisions");
const { different } = require("../maths");
const { CIRCLE, GAME_OBJECT, colorValue, color, defaultValue, AABB } = require("../constants");

module.exports = class GameObject {

    constructor(initInfo) {
        if (initInfo) {
            this.objectId = defaultValue(initInfo.objectId, 0);
            this.x = defaultValue(initInfo.x, 0);
            this.y = defaultValue(initInfo.y, 0);
            this.radius = defaultValue(initInfo.radius, 10);
            this.rotate = defaultValue(initInfo.rotate, 0);
            this.shape = defaultValue(initInfo.shape, CIRCLE);
            this.objectType = defaultValue(initInfo.objectType, GAME_OBJECT);

            // render
            this.color = defaultValue(initInfo.color, '#00aaffff');
            this.alpha = defaultValue(initInfo.alpha, 1);
            this.borderColor = defaultValue(initInfo.borderColor, '#00000055');
            this.borderWidth = defaultValue(initInfo.borderWidth, 0.1);
            this.renderOnMap = defaultValue(initInfo.renderOnMap, true);
            this.healthColor = defaultValue(initInfo.healthColor, '#00ff0099');
            this.healthBarColor = defaultValue(initInfo.healthBarColor, '#00000099');
            this.renderHealthBar = defaultValue(initInfo.renderHealthBar, true);
            this.name = defaultValue(initInfo.name, '');
            this.shieldRadiusMod = defaultValue(initInfo.shieldRadiusMod, 1.5);

            // game
            this.team = defaultValue(initInfo.team, 0);
            this.health = defaultValue(initInfo.health, 100);
            this.maxHealth = defaultValue(initInfo.maxHealth, 100);
            this.bodyDamage = defaultValue(initInfo.bodyDamage, 1);
            this.shield = defaultValue(initInfo.shield, 0);

            // movement
            this.movingDirection = defaultValue(initInfo.movingDirection, 0);
            this.movingSpeed = defaultValue(initInfo.movingSpeed, 0);
            this.momentumX = defaultValue(initInfo.momentumX, 0);
            this.momentumY = defaultValue(initInfo.momentumY, 0);
            this.friction = defaultValue(initInfo.friction, 5);
        }
        this.forces = [];
    }

    /**
     * Returns all object variables.
     */
    getInfo() {
        return [
            this.objectId,
            this.x,
            this.y,
            this.radius,
            this.rotate,
            this.shape,
            this.objectType,

            // render
            colorValue(this.color),
            this.alpha,
            colorValue(this.borderColor),
            this.borderWidth,
            this.renderOnMap,
            colorValue(this.healthColor),
            colorValue(this.healthBarColor),
            this.renderHealthBar,
            this.name,
            this.shieldRadiusMod,
            this.fadeOverTime,

            // game
            this.team,
            this.health,
            this.maxHealth,
            this.bodyDamage,
            this.shield,
            this.ownerId,

            // movement
            this.movingDirection,
            this.movingSpeed,
            this.momentumX,
            this.momentumY,
            this.forces,
            this.friction
        ];
    }

    setInfo(info) {
        let i = 0;
        this.objectId = info[i++];
        this.x = info[i++];
        this.y = info[i++];
        this.radius = info[i++];
        this.rotate = info[i++];
        this.shape = info[i++];
        this.objectType = info[i++];

        // render
        this.color = color(info[i++]);
        this.alpha = info[i++];
        this.borderColor = color(info[i++]);
        this.borderWidth = info[i++];
        this.renderOnMap = info[i++];
        this.healthColor = color(info[i++]);
        this.healthBarColor = color(info[i++]);
        this.renderHealthBar = info[i++];
        this.name = info[i++];
        this.shieldRadiusMod = info[i++];
        this.fadeOverTime = info[i++];

        // game
        this.team = info[i++];
        this.health = info[i++];
        this.maxHealth = info[i++];
        this.bodyDamage = info[i++];
        this.shield = info[i++];
        this.ownerId = info[i++];

        // movement
        this.movingDirection = info[i++];
        this.movingSpeed = info[i++];
        this.momentumX = info[i++];
        this.momentumY = info[i++];
        this.forces = info[i++];
        this.friction = info[i++];
        return i;
    }

    /**
     * Returns object variables that changes frequently and unpredictably.
     */
    getData() {
        return [
            this.objectId,
            this.x,
            this.y,
            this.rotate,
            this.alpha,
            this.health,
            this.shield,
            this.movingDirection,
            this.movingSpeed,
            this.momentumX,
            this.momentumY,
            this.forces
        ];
    }

    setData(data) {
        let i = 1;
        this.x = data[i++];
        this.y = data[i++];
        this.rotate = data[i++];
        this.alpha = data[i++];
        this.health = data[i++];
        this.shield = data[i++];
        this.movingDirection = data[i++];
        this.movingSpeed = data[i++];
        this.momentumX = data[i++];
        this.momentumY = data[i++];
        this.forces = data[i++];
        return i;
    }

    onScreen(game) {
        const { x, y } = game.onScreen(this.x, this.y);
        const radius = this.radius * game.scale;
        return {
            x, y, radius, onScreen: collision({ shape: CIRCLE, x, y, radius }, {
                shape: AABB,
                a: { x: 0, y: 0 },
                b: { x: game.canvas.width, y: game.canvas.height }
            })
        };
    }

    /**
     * Add a force to the object.
     * @param {{x: number, y: number}} force 
     */
    addForce(force) {
        this.forces.push([force.x, force.y]);
    }

    differentTeam(otherObject) {
        let isDifferentTeam = true;
        if (this.ownerId !== undefined)
            isDifferentTeam = this.ownerId !== otherObject.objectId
                && this.ownerId !== otherObject.ownerId;
        return isDifferentTeam && (this.team !== otherObject.team || this.team === 0);
    }

    collide(otherObject) {
        const dif = different(otherObject, this);
        this.addForce({
            x: dif.x,
            y: dif.y
        });

        if (this.differentTeam(otherObject) && otherObject.differentTeam(this)) {
            if (this.shield > 0) this.shield -= otherObject.bodyDamage
            else this.health -= otherObject.bodyDamage;
            if (this.health <= 0) this.removed = true;
            this.alpha = 0.5;
        }
    }

    getShape() {
        if (this.shield > 0) {
            return {
                shape: CIRCLE,
                x: this.x,
                y: this.y,
                radius: this.radius * this.shieldRadiusMod
            };
        }
        return this;
    }

    update(deltaTime) {
        this.forces && this.forces.forEach(force => {
            this.momentumX += force[0];
            this.momentumY += force[1];
        });
        this.forces = [];
        this.movementX = 0;
        this.movementY = 0;
        this.movementX += this.momentumX * deltaTime;
        this.movementY += this.momentumY * deltaTime;
        if (Math.abs(this.momentumX) < 0.001) this.momentumX = 0;
        else this.momentumX *= Math.pow(Math.E, -this.friction * deltaTime);
        if (Math.abs(this.momentumY) < 0.001) this.momentumY = 0;
        else this.momentumY *= Math.pow(Math.E, -this.friction * deltaTime);

        this.movementX += Math.cos(this.movingDirection) * this.movingSpeed * deltaTime;
        this.movementY += Math.sin(this.movingDirection) * this.movingSpeed * deltaTime;
        this.x += this.movementX;
        this.y += this.movementY;

        if (this.alpha < 1) this.alpha += deltaTime * 10;
        else this.alpha = 1;
    }

}
