const GameObject = require(".");
const { GRENADE } = require("../constants");
const CannonBall = require("./CannonBall");

module.exports = class Grenade extends GameObject {

    constructor(initInfo, owner) {
        super({
            radius: 5,
            color: '#F6BD05ff',
            health: !!owner ? 50 : 1,
            maxHealth: !!owner ? 50 : 1,
            bodyDamage: 0,
            borderWidth: 0.3,
            ...initInfo,
            team: !!owner ? owner.team : undefined,
            objectType: GRENADE
        });
        if (owner)
            this.ownerId = owner.objectId;
        this.owner = owner;
        this.timer = 3;
        this.range = 0.5;
        this.thrown = !!owner;
    }

    getInfo() {
        return super.getInfo().concat([
            this.timer,
            this.thrown
        ]);
    }

    setInfo(info) {
        let i = super.setInfo(info);
        this.timer = info[i++];
        this.thrown = info[i++];
        return i;
    }

    update(deltaTime, game) {
        super.update(deltaTime);
        if (this.thrown) {
            this.timer -= deltaTime;
            if (this.timer <= 0 && !this.removed)
                this.explode(game);
        }
    }

    explode(game) {
        this.exploded = true;
        this.removed = true;
        const step = 10 * Math.PI / 180;
        for (let i = 0; i < 36; i++) {
            const x = this.x + Math.cos(i * step) * (i % 2 === 0 ? this.radius * 1.2 : this.radius);
            const y = this.y + Math.sin(i * step) * (i % 2 === 0 ? this.radius * 1.2 : this.radius);
            game.spawn(new CannonBall({
                x, y,
                radius: 2,
                color: this.owner.team === 0 ? '#ff0000ff' : this.owner.color,
                borderWidth: 0.5,
                renderHealthBar: false,
                renderOnMap: false,
                // team: this.owner.team,
                health: 5,
                bodyDamage: 30,
                movingDirection: i * step,
                movingSpeed: 500,
                lifeTime: this.range,
                // ownerId: this.owner.ownerId || this.owner.objectId,
                ownerName: this.owner.name
            }));
        }
    }

    collide(otherObject, game) {
        super.collide(otherObject);
        if (this.thrown) {
            if (this.removed && !this.exploded)
                this.explode(game);
            return;
        }
        if (this.removed && typeof otherObject.setWeapon === 'function') {
            otherObject.grenade++;
        } else {
            this.removed = false;
            this.health = this.maxHealth;
        }
    }

    differentTeam(otherObject) {
        return (this.team !== otherObject.team || this.team === 0)
            && (!this.thrown || (this.ownerId !== otherObject.objectId && this.ownerId !== otherObject.ownerId))
    }

    render(ctx, game) {
        const { x, y, radius, onScreen } = super.render(ctx, game);
        if (!onScreen) return;

        ctx.globalAlpha = this.alpha;
        ctx.lineWidth = radius * this.borderWidth;
        ctx.strokeStyle = Math.floor(this.timer * 5) % 2 === 0 ? 'red' : 'black';
        ctx.beginPath();
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

}
