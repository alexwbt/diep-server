const GameObject = require('.');
const { HEAL_BALL } = require('../constants');

export default class HealBall extends GameObject {

    constructor() {
        super({
            color: '#55dd99ff',
            radius: 9,
            health: 1,
            maxHealth: 1,
            bodyDamage: 0,
            objectType: HEAL_BALL
        });
    }

    collide(otherObject) {
        super.collide(otherObject);
        if (this.removed && typeof otherObject.setWeapon === 'function' &&
            otherObject.health < otherObject.maxHealth) {
            otherObject.health = otherObject.maxHealth;
        } else {
            this.removed = false;
            this.health = this.maxHealth;
        }
    }

    render(ctx, game) {
        const { x, y, radius, onScreen } = super.render(ctx, game);
        if (!onScreen) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(x - radius * 0.1, y - radius * 0.5, radius * 0.2, radius);
        ctx.fillRect(x - radius * 0.5, y - radius * 0.1, radius, radius * 0.2);
    }

}
