const { ROCKET } = require('../constants');
const { radians } = require('../maths');
const CannonBall = require('./CannonBall');

module.exports = class Rocket extends CannonBall {

    constructor(initInfo) {
        super({
            ...initInfo,
            color: '#ddbb66ff'
        });
        this.objectType = ROCKET;
    }

    update(deltaTime, game) {
        super.update(deltaTime, game);
        this.movingSpeed += 300 * deltaTime;
    }

    collide(otherObject, game) {
        super.collide(otherObject);
        const step = 30 * Math.PI / 180;
        for (let i = 0; i < 12; i++) {
            const x = this.x + Math.cos(i * step) * this.radius;
            const y = this.y + Math.sin(i * step) * this.radius;
            game.spawn(new CannonBall({
                x, y,
                radius: this.radius / 5,
                color: '#ff0000ff',
                borderWidth: 0.5,
                renderHealthBar: false,
                renderOnMap: false,
                health: 5,
                bodyDamage: 30,
                movingDirection: i * step,
                movingSpeed: 500,
                lifeTime: 0.1,
                ownerName: this.ownerName
            }));
        }
        this.removed = true;
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
