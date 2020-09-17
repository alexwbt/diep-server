const { degree, different, radians } = require("../maths");
const CannonBall = require("./CannonBall");
const { MISSILE } = require("../constants");

module.exports = class Missile extends CannonBall {

    constructor(initInfo) {
        super({
            ...initInfo,
            friction: 3
        });

        this.objectType = MISSILE;
        this.targetRange = 150;
        this.targetDis = this.targetRange * this.targetRange;
    }

    otherObjectUpdate(otherObject) {
        if (this.target ||
            otherObject.objectId === this.ownerId ||
            !otherObject.weapon ||
            !this.differentTeam(otherObject) ||
            !otherObject.differentTeam(this))
            return;
        const dif = different(this, otherObject);
        const dis = dif.x * dif.x + dif.y * dif.y;
        const range = this.targetRange * this.targetRange;
        if (dis < range && (!this.target || dis < this.targetDis)) {
            this.target = otherObject;
            this.targetDis = dis;
        }
    }

    move(direction) {
        if (this.movingSpeed !== 0 && this.movingDirection !== direction) {
            this.addForce({
                x: Math.cos(this.movingDirection) * this.movingSpeed,
                y: Math.sin(this.movingDirection) * this.movingSpeed
            });
            this.addForce({
                x: Math.cos(direction) * -this.movingSpeed,
                y: Math.sin(direction) * -this.movingSpeed
            });
        }
        this.movingDirection = direction;
    }

    update(deltaTime) {
        if (this.target) {
            const dir = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.rotate = degree(dir);
            this.move(dir);
        } else this.rotate = degree(this.movingDirection);
        super.update(deltaTime);
    }

    render(ctx, game) {
        const { x, y, radius, onScreen } = this.onScreen(game);
        if (!onScreen) return;
        ctx.globalAlpha = this.alpha;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        const step = (Math.PI * 2) / 3;
        for (let i = 0; i < 3; i++) {
            const vertX = x + Math.cos(radians(this.rotate) + i * step) * radius;
            const vertY = y + Math.sin(radians(this.rotate) + i * step) * radius;
            if (i === 0) ctx.moveTo(vertX, vertY);
            else ctx.lineTo(vertX, vertY);
        }
        ctx.fill();

        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = radius * this.borderWidth;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const vertX = x + Math.cos(radians(this.rotate) + i * step) * (radius - ctx.lineWidth / 2);
            const vertY = y + Math.sin(radians(this.rotate) + i * step) * (radius - ctx.lineWidth / 2);
            if (i === 0) ctx.moveTo(vertX, vertY);
            else ctx.lineTo(vertX, vertY);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

}
