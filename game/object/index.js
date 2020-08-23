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

            // game
            this.team = defaultValue(initInfo.team, 0);
            this.health = defaultValue(initInfo.health, 100);
            this.maxHealth = defaultValue(initInfo.maxHealth, 100);
            this.bodyDamage = defaultValue(initInfo.bodyDamage, 1);

            // movement
            this.movingDirection = defaultValue(initInfo.movingDirection, 0);
            this.movingSpeed = defaultValue(initInfo.movingSpeed, 0);
            this.momentumX = defaultValue(initInfo.momentumX, 0);
            this.momentumY = defaultValue(initInfo.momentumY, 0);
        }
        this.forces = [];
        this.friction = 5;
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

            // game
            this.team,
            this.health,
            this.maxHealth,
            this.bodyDamage,

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

        // game
        this.team = info[i++];
        this.health = info[i++];
        this.maxHealth = info[i++];
        this.bodyDamage = info[i++];

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
            this.health,
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
        this.health = data[i++];
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
        return this.team !== otherObject.team || this.team === 0;
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
            this.momentumX += force[0];
            this.momentumY += force[1];
        });
        this.forces = [];
        this.x += this.momentumX * deltaTime;
        this.y += this.momentumY * deltaTime;
        if (Math.abs(this.momentumX) < 0.001) this.momentumX = 0;
        else this.momentumX *= Math.pow(Math.E, -this.friction * deltaTime);
        if (Math.abs(this.momentumY) < 0.001) this.momentumY = 0;
        else this.momentumY *= Math.pow(Math.E, -this.friction * deltaTime);

        this.x += Math.cos(this.movingDirection) * this.movingSpeed * deltaTime;
        this.y += Math.sin(this.movingDirection) * this.movingSpeed * deltaTime;

        if (this.alpha < 1) this.alpha += deltaTime * 10;
        else this.alpha = 1;
    }

    render(ctx, game) {
        const { x, y, radius, onScreen } = this.onScreen(game);
        if (!onScreen) return;
        ctx.globalAlpha = this.alpha;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = radius * this.borderWidth;
        ctx.beginPath();
        ctx.arc(x, y, radius * (1 - this.borderWidth / 2) + 0.5, 0, 2 * Math.PI);
        ctx.stroke();

        this.healthBarRender(ctx, x, y, radius);

        if (this.name) {
            ctx.font = "30px consolas";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(this.name, x, y - radius * 1.5);
        }
        ctx.globalAlpha = 1;
    }

    healthBarRender(ctx, x, y, radius) {
        if (this.renderHealthBar && this.health !== this.maxHealth) {
            ctx.fillStyle = this.healthBarColor;
            ctx.fillRect(x - radius, y + radius * 1.2, radius * 2, 8);
            ctx.fillStyle = this.healthColor;
            ctx.fillRect(x - radius, y + radius * 1.2, radius * 2 * this.health / this.maxHealth, 8);
        }
    }

    onMap(map) {
        const { x, y } = map.onMap(this.x, this.y);
        const radius = this.radius * map.scale;
        return {
            x, y, radius,
            onMap: collision({ shape: CIRCLE, x, y, radius }, { shape: CIRCLE, x: map.x, y: map.y, radius: map.radius })
        };
    }

    mapRender(ctx, map) {
        const { x, y, radius, onMap } = this.onMap(map);
        if (!onMap) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

}
