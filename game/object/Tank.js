const GameObject = require(".");
const Weapon = require("../weapon");
const { radians, different } = require("../maths");
const { TANK, defaultValue, WEAPON_BALL } = require("../constants");
const Grenade = require("./Grenade");

module.exports = class Tank extends GameObject {

    constructor(initInfo) {
        super({
            ...initInfo,
            objectType: TANK
        });
        if (initInfo) {
            this.movementSpeed = defaultValue(initInfo.movementSpeed, 80);
            this.reloadSpeed = defaultValue(initInfo.reloadSpeed, 0.60);
            this.bulletSpeed = defaultValue(initInfo.bulletSpeed, 125);
            this.bulletDamage = defaultValue(initInfo.bulletDamage, 3);
            this.bulletPenetration = defaultValue(initInfo.bulletPenetration, 10);
            this.setWeapon(defaultValue(initInfo.weaponType, 'singleCannon'));
        }
        this.grenade = 0;
        this.maxDashFuel = 5;
        this.dashFuel = this.maxDashFuel;
    }

    getInfo() {
        return super.getInfo().concat([
            this.movementSpeed,
            this.reloadSpeed,
            this.bulletSpeed,
            this.bulletDamage,
            this.bulletPenetration,
            this.weaponType,
            this.weapon.getData(),
            this.grenade,
            this.maxDashFuel,
            this.dashFuel,
            this.dashPoint1,
            this.dashPoint2
        ]);
    }

    setInfo(info) {
        let i = super.setInfo(info);
        this.movementSpeed = info[i++];
        this.reloadSpeed = info[i++];
        this.bulletSpeed = info[i++];
        this.bulletDamage = info[i++];
        this.bulletPenetration = info[i++];
        this.setWeapon(info[i++], info[i++]);
        this.grenade = info[i++];
        this.maxDashFuel = info[i++];
        this.dashFuel = info[i++];
        this.dashPoint1 = info[i++];
        this.dashPoint2 = info[i++];
        return i;
    }

    getData() {
        return super.getData().concat([
            this.weapon.firing,
            this.weaponType,
            this.weapon.getData(),
            this.grenade,
            this.maxDashFuel,
            this.dashFuel,
            this.dashPoint1,
            this.dashPoint2
        ]);
    }

    setData(data) {
        let i = super.setData(data);
        this.weapon.firing = data[i++];
        this.setWeapon(data[i++], data[i++]);
        this.grenade = data[i++];
        this.maxDashFuel = data[i++];
        this.dashFuel = data[i++];
        this.dashPoint1 = data[i++];
        this.dashPoint2 = data[i++];
        return i;
    }

    setWeapon(weaponType, data) {
        this.weaponType = weaponType;
        this.weapon = new Weapon(this, weaponType);
        if (data) this.weapon.setData(data);
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
        const speed = this.movementSpeed * (this.dashing && this.dashFuel > 0 ? 2 : 1);
        if (this.movingSpeed < speed)
            this.movingSpeed += speed * deltaTime;
        else this.movingSpeed = speed;
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

    throwGrenade(game) {
        if (this.grenade >= 1) {
            this.grenade--;
            const dir = radians(this.rotate);
            const x = Math.cos(dir);
            const y = Math.sin(dir);
            const grenade = new Grenade({
                x: this.x + x * (this.radius + 5),
                y: this.y + y * (this.radius + 5)
            }, this);
            grenade.addForce({
                x: x * 500,
                y: y * 500
            });
            game.spawn(grenade);
        }
    }

    flash() {
        if (this.dashFuel >= this.maxDashFuel) {
            const dir = radians(this.rotate);
            const dis = this.radius * 10;
            this.momentumX = 0;
            this.momentumY = 0;
            this.dashPoint1 = { x: this.x, y: this.y };
            this.x += Math.cos(dir) * dis;
            this.y += Math.sin(dir) * dis;
            this.dashPoint2 = { x: this.x, y: this.y };
            this.alpha = 0;
            this.dashFuel = 0;
        }
    }

    collide(otherObject) {
        if (otherObject.objectType < WEAPON_BALL) {
            const dif = different(otherObject, this);
            this.addForce({
                x: dif.x,
                y: dif.y
            });
        }

        if (this.differentTeam(otherObject) && otherObject.differentTeam(this)) {
            if (this.shield > 0) this.shield -= otherObject.bodyDamage
            else this.health -= otherObject.bodyDamage;
            if (this.health <= 0) this.removed = true;
            this.alpha = 0.5;
        }
    }

    update(deltaTime, game) {
        super.update(deltaTime);
        this.weapon.update(deltaTime, game);
        if (this.dashing) this.dashFuel -= deltaTime;
        else this.dashFuel += deltaTime * 0.6;
        this.dashFuel = Math.max(0, Math.min(this.maxDashFuel, this.dashFuel));

        if ((this.dashPoint1 || this.dashPoint2) && this.alpha === 1) {
            this.dashPoint1 = null;
            this.dashPoint2 = null;
        }
    }

}
