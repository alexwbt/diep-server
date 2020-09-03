const Tank = require("./Tank");
const { AD_TANK, defaultValue } = require("../constants");
const { degree, different, radians } = require("../maths");

module.exports = class AutoDefenseTank extends Tank {

    constructor(initInfo, owner) {
        super({
            radius: 5,
            borderWidth: 0.3,
            health: 50,
            maxHealth: 50,
            color: '#aaccffff',
            team: owner.team,

            bulletDamage: 0.5,

            ...initInfo,
        });
        this.objectType = AD_TANK;
        this.owner = owner;
        this.ownerId = owner.objectId;
        if (initInfo) {
            this.targetRange = defaultValue(initInfo.targetRange, 150);
        }
    }

    update(deltaTime, game) {
        super.update(deltaTime, game);
        this.weapon.firing = false;

        const dif = different(this, this.owner);
        const dis = dif.x * dif.x + dif.y * dif.y;
        const range = 10000;
        if (dis > range) this.move(Math.atan2(dif.y, dif.x), deltaTime);
        else if (this.target) {
            this.weapon.firing = true;
            const dir = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.rotate = degree(dir);
            this.move(dir, deltaTime);
            this.target = false;
        } else this.stop();
        if (!this.weapon.firing) this.rotate = this.owner.rotate;
    }

    otherObjectUpdate(otherObject) {
        if (otherObject.objectId === this.ownerId ||
            !otherObject.weapon ||
            !otherObject.name ||
            !this.differentTeam(otherObject) ||
            !otherObject.differentTeam(this))
            return;
        const dif = different(this, otherObject);
        const dis = dif.x * dif.x + dif.y * dif.y;
        const range = this.targetRange * this.targetRange;
        if (dis < range && (!this.target || dis < this.targetDis)) {
            this.target = otherObject;
            this.targetDis = dis;
        }
    }

}
