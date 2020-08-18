const { collision } = require("../collisions");
const { pythagorean, radians } = require("../maths");
const { createObjectInfo } = require("../object");
const CannonBall = require("../object/CannonBall");

const createCannonInfo = (owner, info) => ({
    owner,
    x: 0,
    y: 0,
    width: 0.8,
    length: 1.5,
    rotate: 0,
    delay: 0,
    recoil: 0.1,
    reloadSpeed: 1,

    // bullet
    bulletSpeed: 1,
    bulletDamage: 1,
    bulletPenetration: 1,
    range: 2,

    ...info
});

module.exports = class Cannon {

    constructor(info) {
        this.owner = info.owner;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.length = info.length;
        this.rotate = info.rotate;
        this.delay = info.delay;
        this.recoil = info.recoil;
        this.reloadSpeed = info.reloadSpeed;

        // bullet
        this.bulletSpeed = info.bulletSpeed;
        this.bulletDamage = info.bulletDamage;
        this.bulletPenetration = info.bulletPenetration;
        this.range = info.range;

        this.type = "polygon";
        this.color = "#aaa";
        this.reloadCounter = 0;
    }

    getData() {
        return this.reloadCounter;
    }

    setData(data) {
        this.reloadCounter = data;
    }

    getVertices() {
        const rotate = radians(this.owner.rotate) + this.rotate;
        const reloadProgress = 1 - this.reloadCounter / (this.reloadSpeed * this.owner.reloadSpeed);
        const length = this.length * (1 - this.recoil + Math.min(1, reloadProgress) * this.recoil);

        const vertices = [
            { x: this.x, y: this.y - this.width / 2 },
            { x: this.x + length, y: this.y - this.width / 2 },
            { x: this.x + length, y: this.y + this.width / 2 },
            { x: this.x, y: this.y + this.width / 2 }
        ];

        for (let i = 0; i < vertices.length; i++) {
            const dir = Math.atan2(vertices[i].y, vertices[i].x) + rotate;
            const mag = pythagorean(vertices[i].x, vertices[i].y);
            const x = this.owner.x + Math.cos(dir) * this.owner.radius * mag;
            const y = this.owner.y + Math.sin(dir) * this.owner.radius * mag;
            vertices[i] = { x, y };
        }
        return vertices;
    }

    update(deltaTime, game) {
        if (this.reloadCounter > 0 || (this.owner.weapon.firing && this.reloadCounter > -this.delay * this.reloadSpeed))
            this.reloadCounter -= deltaTime;
        else if (this.owner.weapon.firing) {
            const x = (this.x + this.length) * this.owner.radius;
            const y = this.y * this.owner.radius;
            const dir = Math.atan2(y, x) + radians(this.owner.rotate) + this.rotate;
            const mag = pythagorean(x, y);
            game.spawn(new CannonBall(createObjectInfo({
                x: this.owner.x + Math.cos(dir) * mag,
                y: this.owner.y + Math.sin(dir) * mag,
                radius: this.owner.radius * this.width / 2,
                color: 'red',
                borderWidth: 0.5,
                renderHealthBar: false,
                renderOnMap: false,
                team: this.owner.team,
                health: this.owner.bulletPenetration * this.bulletPenetration,
                bodyDamage: this.owner.bulletDamage * this.bulletDamage,
                movingDirection: radians(this.owner.rotate) + this.rotate,
                movingSpeed: this.bulletSpeed * this.owner.bulletSpeed,
                lifeTime: this.range,
                ownerId: this.owner.objectId
            })));

            this.reloadCounter = (this.owner.reloadSpeed - this.delay) * this.reloadSpeed;
        }
    }

}

module.exports.createCannonInfo = createCannonInfo;
