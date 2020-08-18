const GameObject = require(".");
const { createObjectInfo } = GameObject;
const Weapon = require("../weapon");

const createTankInfo = info => ({
    movementSpeed: 50,
    reloadSpeed: 1,
    bulletSpeed: 100,
    bulletDamage: 1,
    bulletPenetration: 10,
    weaponType: 'singleCannon',
    ...createObjectInfo(info)
});

module.exports = class Tank extends GameObject {

    getData() {
        return {
            ...super.getData(),
            movementSpeed: this.movementSpeed,
            reloadSpeed: this.reloadSpeed,
            bulletSpeed: this.bulletSpeed,
            bulletDamage: this.bulletDamage,
            bulletPenetration: this.bulletPenetration,
            weapon: this.weapon.getData(),
            objectType: 'Tank',

            control: this.getControl()
        };
    }

    setData(data) {
        super.setData(data);
        this.movementSpeed = data.movementSpeed;
        this.reloadSpeed = data.reloadSpeed;
        this.bulletSpeed = data.bulletSpeed;
        this.bulletDamage = data.bulletDamage;
        this.bulletPenetration = data.bulletPenetration;

        if (data.weapon) {
            this.weapon = new Weapon(this, data.weapon.type);
            this.weapon.setData(data.weapon);
        } else {
            this.weapon = new Weapon(this, data.weaponType);
        }
    }

    move(direction, deltaTime) {
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
        if (this.movingSpeed < this.movementSpeed)
            this.movingSpeed += this.movementSpeed * deltaTime;
        else this.movingSpeed = this.movementSpeed;
    }

    stop() {
        if (this.movingSpeed > 0) {
            this.addForce({
                x: Math.cos(this.movingDirection) * this.movingSpeed,
                y: Math.sin(this.movingDirection) * this.movingSpeed
            });
            this.movingSpeed = 0;
        }
    }

    update(deltaTime, game) {
        super.update(deltaTime);
        this.weapon.update(deltaTime, game);
    }

}

module.exports.createTankInfo = createTankInfo;
