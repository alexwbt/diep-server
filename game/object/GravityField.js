const GameObject = require('.');
const { GRAVITY_FIELD } = require('../constants');

module.exports = class GravityField extends GameObject {

    constructor(initInfo) {
        super({
            color: '#44444477',
            radius: 200,
            bodyDamage: 0,
            renderHealthBar: false,
            ...initInfo,
            borderWidth: 0.05,
            objectType: GRAVITY_FIELD,
        });
    }

    collide(otherObject) {
        otherObject.forces = [];
        otherObject.movingSpeed = 0;
        otherObject.alpha = 1;
    }

    update(deltaTime) {
        this.radius -= 10 * deltaTime;
        if (this.radius < 10) this.removed = true;
    }

    addForce() { }

}
