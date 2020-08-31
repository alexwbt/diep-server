const GameObject = require(".");
const { AD_TANK_BALL } = require("../constants");
const AutoDefenseTank = require("./AutoDefenseTank");

module.exports = class AutoDefenseTankBall extends GameObject {

    constructor() {
        super({
            radius: 5,
            color: '#aaccffff',
            borderWidth: 0.3,
            health: 1,
            maxHealth: 1,
            bodyDamage: 0,
            objectType: AD_TANK_BALL
        })
    }

    collide(otherObject, game) {
        super.collide(otherObject);
        if (this.removed && typeof otherObject.setWeapon === 'function') {
            game.spawn(new AutoDefenseTank({
                x: this.x,
                y: this.y
            }, otherObject));
        } else {
            this.removed = false;
            this.health = this.maxHealth;
        }
    }

}
