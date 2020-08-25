const GameObject = require('.');
const { SHIELD_BALL } = require('../constants');

module.exports = class ShieldBall extends GameObject {

    constructor() {
        super({
            color: '#8888ddff',
            radius: 9,
            health: 1,
            maxHealth: 1,
            bodyDamage: 0,
            objectType: SHIELD_BALL
        });
    }

    collide(otherObject) {
        super.collide(otherObject);
        if (this.removed && typeof otherObject.setWeapon === 'function') {
            otherObject.shield += 10;
        } else {
            this.removed = false;
            this.health = this.maxHealth;
        }
    }

    render(ctx, game) {
        const { x, y, radius, onScreen } = super.render(ctx, game);
        if (!onScreen) return;

        ctx.fillStyle = 'white';

        const x1 = radius * 0.45;
        const y0 = radius * -0.5;
        const y1 = radius * -0.3;
        const y2 = radius * 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y + y0);
        ctx.lineTo(x - x1, y + y1);
        ctx.bezierCurveTo(x - x1, y + y2, x, y + y2, x, y + y2);
        ctx.bezierCurveTo(x, y + y2, x + x1, y + y2, x + x1, y + y1);
        ctx.lineTo(x, y + y0);
        ctx.fill();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.3 * game.scale;
        ctx.beginPath();
        ctx.moveTo(x, y + y0 * 0.8);
        ctx.lineTo(x - x1 * 0.8, y + y1 * 0.8);
        ctx.bezierCurveTo(x - x1 * 0.8, y + y2 * 0.8, x, y + y2 * 0.8, x, y + y2 * 0.8);
        ctx.bezierCurveTo(x, y + y2 * 0.8, x + x1 * 0.8, y + y2 * 0.8, x + x1 * 0.8, y + y1 * 0.8);
        ctx.lineTo(x, y + y0 * 0.8);
        ctx.stroke();
    }

}
