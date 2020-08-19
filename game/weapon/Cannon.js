const { pythagorean, radians } = require("../maths");
const CannonBall = require("../object/CannonBall");

const createCannonInfo = info => ({
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

    constructor(owner, info) {
        const data = createCannonInfo(info);
        this.owner = owner;
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.length = data.length;
        this.rotate = data.rotate;
        this.delay = data.delay;
        this.recoil = data.recoil;
        this.reloadSpeed = data.reloadSpeed;

        // bullet
        this.bulletSpeed = data.bulletSpeed;
        this.bulletDamage = data.bulletDamage;
        this.bulletPenetration = data.bulletPenetration;
        this.range = data.range;

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
            const cannonDir = radians(this.owner.rotate) + this.rotate;
            const dir = Math.atan2(y, x) + cannonDir;
            const mag = pythagorean(x, y);
            const radius = this.owner.radius * this.width / 2;
            const movingSpeed = this.bulletSpeed * this.owner.bulletSpeed;
            game.spawn(new CannonBall({
                x: this.owner.x + Math.cos(dir) * mag,
                y: this.owner.y + Math.sin(dir) * mag,
                radius,
                color: 'red',
                borderWidth: 0.5,
                renderHealthBar: false,
                renderOnMap: false,
                team: this.owner.team,
                health: this.owner.bulletPenetration * this.bulletPenetration,
                bodyDamage: this.owner.bulletDamage * this.bulletDamage,
                movingDirection: radians(this.owner.rotate) + this.rotate,
                movingSpeed,
                lifeTime: this.range,
                ownerId: this.owner.objectId
            }));
            this.owner.addForce({
                x: -Math.cos(cannonDir) * movingSpeed * radius * 0.1,
                y: -Math.sin(cannonDir) * movingSpeed * radius * 0.1
            });

            this.reloadCounter = (this.owner.reloadSpeed - this.delay) * this.reloadSpeed;
        }
    }

}

module.exports.createCannonInfo = createCannonInfo;
