const GameObject = require(".");
const Weapon = require("../weapon");
const { radians } = require("../maths");
const { TANK, defaultValue } = require("../constants");

module.exports = class Tank extends GameObject {

    constructor(initInfo) {
        super({
            ...initInfo,
            objectType: TANK
        });
        if (initInfo) {
            this.movementSpeed = defaultValue(initInfo.movementSpeed, 60);
            this.reloadSpeed = defaultValue(initInfo.reloadSpeed, 0.60);
            this.bulletSpeed = defaultValue(initInfo.bulletSpeed, 125);
            this.bulletDamage = defaultValue(initInfo.bulletDamage, 3);
            this.bulletPenetration = defaultValue(initInfo.bulletPenetration, 10);
            this.setWeapon(defaultValue(initInfo.weaponType, 'singleCannon'));
        }
    }

    getInfo() {
        return super.getInfo().concat([
            this.movementSpeed,
            this.reloadSpeed,
            this.bulletSpeed,
            this.bulletDamage,
            this.bulletPenetration,
            this.weaponType,
            this.weapon.getData()
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
        return i;
    }

    getData() {
        return super.getData().concat([
            this.weapon.firing
        ]);
    }

    setData(data) {
        let i = super.setData(data);
        this.weapon.firing = data[i++];
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

    render(ctx, game) {
        ctx.globalAlpha = this.alpha;
        this.weapon.render(ctx, game);
        ctx.globalAlpha = 0;
        super.render(ctx, game);
    }

    mapRender(ctx, map) {
        const { x, y, radius, onMap } = this.onMap(map);
        if (!onMap) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();



        let dir = radians(this.rotate);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(dir) * radius * 2, y + Math.sin(dir) * radius * 2);
        dir += radians(30);
        ctx.lineTo(x + Math.cos(dir) * radius * 1.5, y + Math.sin(dir) * radius * 1.5);
        dir -= radians(60);
        ctx.lineTo(x + Math.cos(dir) * radius * 1.5, y + Math.sin(dir) * radius * 1.5);
        ctx.closePath();
        ctx.fill();
    }

}
