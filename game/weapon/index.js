const Cannon = require('./Cannon');
const { createCannonInfo } = Cannon;

module.exports = class Weapon {

    constructor(owner, type) {
        this.type = type;
        this.firing = false;
        this.components = [];
        switch (type) {
            default:
                this.components.push(new Cannon(createCannonInfo(owner)));
                break;
            case 'twinCannon':
                this.components.push(new Cannon(createCannonInfo(owner, { y: 0.5, })));
                this.components.push(new Cannon(createCannonInfo(owner, { y: -0.5, delay: owner.reloadSpeed / 2 })));
                break;
            case 'triplet':
                this.components.push(new Cannon(createCannonInfo(owner, { y: 0.5, delay: owner.reloadSpeed / 2 })));
                this.components.push(new Cannon(createCannonInfo(owner, { y: -0.5, delay: owner.reloadSpeed / 2 })));
                this.components.push(new Cannon(createCannonInfo(owner, { width: 1, length: 1.6 })));
                break;
            case 'minigun':
                this.components.push(new Cannon(createCannonInfo(owner, { reloadSpeed: 0.5, width: 0.4, y: 0.25 })));
                this.components.push(new Cannon(createCannonInfo(owner, { reloadSpeed: 0.5, width: 0.4, y: -0.25 })));
                this.components.push(new Cannon(createCannonInfo(owner, { reloadSpeed: 0.5, width: 0.4, y: 0.7, length: 1.3, delay: owner.reloadSpeed / 2 })));
                this.components.push(new Cannon(createCannonInfo(owner, { reloadSpeed: 0.5, width: 0.4, y: -0.7, length: 1.3, delay: owner.reloadSpeed / 2 })));
                break;
        }
    }

    getData() {
        return {
            type: this.type,
            firing: this.firing,
            components: this.components.map(c => c.getData())
        };
    }

    setData(data) {
        this.firing = data.firing;
        this.components.forEach((c, i) => c.setData(data.components[i]));
    }

    fire(firing) {
        this.firing = firing;
    }

    update(deltaTime, game) {
        this.components.forEach(c => c.update(deltaTime, game));
    }

}
