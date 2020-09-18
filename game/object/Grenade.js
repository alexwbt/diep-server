const GameObject = require(".");
const { GRENADE } = require("../constants");
const CannonBall = require("./CannonBall");
const GravityField = require("./GravityField");

const grenades = {
    default: {
        color: '#F6BD05ff',
        timer: 3,
        explode: (game, grenade) => {
            const step = 10 * Math.PI / 180;
            for (let i = 0; i < 36; i++) {
                const x = grenade.x + Math.cos(i * step) * grenade.radius;
                const y = grenade.y + Math.sin(i * step) * grenade.radius;
                game.spawn(new CannonBall({
                    x, y,
                    radius: 2,
                    color: grenade.owner.team === 0 ? '#ff0000ff' : grenade.owner.color,
                    borderWidth: 0.5,
                    renderHealthBar: false,
                    renderOnMap: false,
                    health: 5,
                    bodyDamage: 30,
                    movingDirection: i * step,
                    movingSpeed: (i % 2 === 0 ? 500 : 500 * 0.5),
                    lifeTime: 0.5,
                    ownerName: grenade.owner.name
                }));
            }
        }
    },
    black: {
        color: '#444444ff',
        timer: 2,
        explode: (game, grenade) => {
            game.spawn(new GravityField({
                x: grenade.x,
                y: grenade.y
            }));
        }
    }
};

module.exports = class Grenade extends GameObject {

    constructor(initInfo, type = 'default', owner) {
        super({
            radius: 5,
            color: grenades[type].color,
            health: !!owner ? 50 : 1,
            maxHealth: !!owner ? 50 : 1,
            bodyDamage: 0,
            borderWidth: 0.3,
            ...initInfo,
            team: !!owner ? owner.team : undefined,
            objectType: GRENADE
        });
        if (owner) this.ownerId = owner.objectId;
        this.owner = owner;
        this.timer = grenades[type].timer;
        this.thrown = !!owner;
        this.type = type;
    }

    getInfo() {
        return super.getInfo().concat([
            this.timer,
            this.thrown,
            this.type,
        ]);
    }

    setInfo(info) {
        let i = super.setInfo(info);
        this.timer = info[i++];
        this.thrown = info[i++];
        this.type = info[i++];
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
        grenades[this.type].explode(game, this);
    }

    collide(otherObject) {
        super.collide(otherObject);
        if (this.thrown) return;
        if (this.removed && typeof otherObject.setWeapon === 'function' && otherObject.name && !otherObject.grenade)
            otherObject.grenade = this.type;
        else {
            this.removed = false;
            this.health = this.maxHealth;
        }
    }

}
