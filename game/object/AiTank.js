const Tank = require("./Tank");
const { defaultValue, HEAL_BALL, WEAPON_BALL, TANK, SHIELD_BALL } = require("../constants");
const { degree, different } = require("../maths");

module.exports = class AiTank extends Tank {

    constructor(initInfo = {}) {
        super({
            team: -2,
            color: '#994466ff',
            ...initInfo
        });
        this.targetRange = defaultValue(initInfo.targetRange, 2000);
        this.killTarget = false;
    }

    update(deltaTime, game) {
        super.update(deltaTime, game);
        this.weapon.firing = false;

        if (this.target) {
            const comp = this.weapon.getLastComponent();
            const bulletSpeed = this.bulletSpeed * comp.bulletSpeed;

            const dif = different(this, this.target);
            const dis = dif.x * dif.x + dif.y * dif.y;
            const fireRange = bulletSpeed * comp.range;
            this.weapon.firing = this.killTarget && dis < fireRange * fireRange;

            let targetX = this.target.x
            let targetY = this.target.y;
            if (this.weapon.firing) {
                let bulletTravelTime = dis / (bulletSpeed * bulletSpeed);
                targetX += Math.min(50, this.target.movementX * bulletTravelTime / deltaTime);
                targetY += Math.min(50, this.target.movementY * bulletTravelTime / deltaTime);
            }
            const dir = Math.atan2(targetY - this.y, targetX - this.x);
            this.rotate = degree(dir);
            this.move(dir, deltaTime);

            this.target = false;
        } else this.stop();
    }

    otherObjectUpdate(otherObject) {
        let isTarget = false;
        switch (otherObject.objectType) {
            case WEAPON_BALL:
                isTarget = !this.weapon.weaponIndex;
                break;
            case HEAL_BALL:
                isTarget = this.health < this.maxHealth;
                break;
            case SHIELD_BALL:
                isTarget = !this.shield;
                break;
            case TANK:
                isTarget = !!this.weapon.weaponIndex;
                break;
            default:
        }
        if (!isTarget ||
            !this.differentTeam(otherObject) ||
            !otherObject.differentTeam(this))
            return;
        const dif = different(this, otherObject);
        const dis = dif.x * dif.x + dif.y * dif.y;
        const range = this.targetRange * this.targetRange;
        if (dis < range && (!this.target || dis < this.targetDis)) {
            this.target = otherObject;
            this.targetDis = dis;
            this.killTarget = otherObject.objectType === TANK;
        }
    }

}
