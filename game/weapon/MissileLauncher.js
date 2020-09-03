const Cannon = require('./Cannon');
const { radians, pythagorean } = require('../maths');
const Missile = require('../object/Missile');

module.exports = class MissileLauncher extends Cannon {

    constructor(owner, info) {
        super(owner, info);
        this.color = "#555";
    }

    update(deltaTime, game) {
        if (this.reloadCounter > 0 || (this.owner.weapon.firing && this.reloadCounter > -this.delay * this.reloadSpeed))
            this.reloadCounter -= deltaTime;
        else if (this.owner.weapon.firing) {
            const x = (this.x + this.length) * this.owner.radius;
            const y = this.y * this.owner.radius;
            const cannonDir = radians(this.owner.rotate) + this.rotate;
            const dir = Math.atan2(y, x) + cannonDir;
            const mag = pythagorean(x, y);
            const radius = this.owner.radius * this.width / 2;
            const movingSpeed = this.bulletSpeed * this.owner.bulletSpeed;
            game.spawn(new Missile({
                x: this.owner.x + Math.cos(dir) * mag,
                y: this.owner.y + Math.sin(dir) * mag,
                radius,
                color: this.owner.team === 0 ? '#ff0000ff' : this.owner.color,
                borderWidth: 0.5,
                renderHealthBar: false,
                renderOnMap: false,
                team: this.owner.team,
                health: this.owner.bulletPenetration * this.bulletPenetration,
                bodyDamage: this.owner.bulletDamage * this.bulletDamage,
                movingDirection: radians(this.owner.rotate) + this.rotate,
                movingSpeed,
                lifeTime: this.range,
                ownerId: this.owner.ownerId || this.owner.objectId,
                ownerName: this.owner.name
            }));
            this.owner.addForce({
                x: -Math.cos(cannonDir) * movingSpeed * radius * 0.1,
                y: -Math.sin(cannonDir) * movingSpeed * radius * 0.1
            });

            this.reloadCounter = (this.owner.reloadSpeed - this.delay) * this.reloadSpeed;
        }
    }

}
