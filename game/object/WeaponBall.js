const GameObject = require('.');
const Tank = require('./Tank');
const { weaponList } = require('../weapon');

module.exports = class WeaponBall extends GameObject {

    constructor() {
        super({
            color: 'white',
            health: 1,
            maxHealth: 1,
            bodyDamage: 0,
            weaponBallType: weaponList[Math.floor(Math.random() * weaponList.length)].name
        });
    }

    getData() {
        return {
            ...super.getData(),
            weaponBallType: this.weaponBallType,
            objectType: 'WeaponBall'
        };
    }

    setData(data) {
        super.setData(data);
        this.weaponBallType = data.weaponBallType;
    }

    collide(otherObject) {
        super.collide(otherObject);
        if (this.removed && typeof otherObject.setWeapon === 'function') {
            otherObject.setWeapon(this.weaponBallType);
        } else {
            this.removed = false;
            this.health = this.maxHealth;
        }
    }


}
