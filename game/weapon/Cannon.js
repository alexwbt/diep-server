const { collision } = require("../collisions");
const { pythagorean, radians } = require("../maths");
const CannonBall = require("../object/CannonBall");
const { AABB } = require("../constants");

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

    getVertices(game, mod = 0) {
        const rotate = radians(this.owner.rotate) + this.rotate;
        const reloadProgress = 1 - this.reloadCounter / (this.reloadSpeed * this.owner.reloadSpeed);
        const length = this.length * (1 - this.recoil + Math.min(1, reloadProgress) * this.recoil);

        const vertices = [
            { x: this.x + mod, y: this.y - this.width / 2 + mod },
            { x: this.x + length - mod, y: this.y - this.width / 2 + mod },
            { x: this.x + length - mod, y: this.y + this.width / 2 - mod },
            { x: this.x + mod, y: this.y + this.width / 2 - mod }
        ];

        for (let i = 0; i < vertices.length; i++) {
            const dir = Math.atan2(vertices[i].y, vertices[i].x) + rotate;
            const mag = pythagorean(vertices[i].x, vertices[i].y);
            const x = this.owner.x + Math.cos(dir) * this.owner.radius * mag;
            const y = this.owner.y + Math.sin(dir) * this.owner.radius * mag;
            vertices[i] = game ? game.onScreen(x, y) : { x, y };
        }
        return vertices;
    }

    onScreen(game) {
        const vertices = this.getVertices(game);
        const a = { x: vertices[0].x, y: vertices[0].y };
        const b = { x: vertices[0].x, y: vertices[0].y };
        vertices.forEach(vertex => {
            a.x = Math.min(a.x, vertex.x);
            a.y = Math.min(a.y, vertex.y);
            b.x = Math.max(b.x, vertex.x);
            b.y = Math.max(b.y, vertex.y);
        });
        return {
            vertices: this.getVertices(game),
            onScreen: collision({ shape: AABB, a, b }, {
                shape: AABB,
                a: { x: 0, y: 0 },
                b: { x: game.canvas.width, y: game.canvas.height }
            })
        };
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
                color: '#ff0000ff',
                borderWidth: 0.5,
                renderHealthBar: false,
                renderOnMap: false,
                team: this.owner.team,
                health: this.owner.bulletPenetration * this.bulletPenetration,
                bodyDamage: this.owner.bulletDamage * this.bulletDamage,
                movingDirection: radians(this.owner.rotate) + this.rotate,
                movingSpeed,
                lifeTime: this.range,
                ownerId: this.owner.objectId,
                ownerName: this.owner.name
            }));
            this.owner.addForce({
                x: -Math.cos(cannonDir) * movingSpeed * radius * 0.1,
                y: -Math.sin(cannonDir) * movingSpeed * radius * 0.1
            });

            this.reloadCounter = (this.owner.reloadSpeed - this.delay) * this.reloadSpeed;
        }
    }

    render(ctx, game) {
        const { vertices, onScreen } = this.onScreen(game);
        if (!onScreen) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++)
            ctx.lineTo(vertices[i].x, vertices[i].y);
        ctx.closePath();
        ctx.fill();

        const borderVertices = this.getVertices(game, this.owner.borderWidth / 2);
        ctx.strokeStyle = this.owner.borderColor;
        ctx.lineWidth = this.owner.radius * game.scale * this.owner.borderWidth;
        ctx.beginPath();
        ctx.moveTo(borderVertices[0].x, borderVertices[0].y);
        for (let i = 1; i < borderVertices.length; i++)
            ctx.lineTo(borderVertices[i].x, borderVertices[i].y);
        ctx.closePath();
        ctx.stroke();
    }

}
