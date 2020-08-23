const Cannon = require("./Cannon");

const weaponList = [
    {
        name: 'singleCannon',
        compose: (weapon, owner) => {
            weapon.components.push(new Cannon(owner));
        }
    },
    {
        name: 'twinCannon',
        compose: (weapon, owner) => {
            weapon.components.push(new Cannon(owner, { y: 0.5, }));
            weapon.components.push(new Cannon(owner, { y: -0.5, delay: owner.reloadSpeed / 2 }));
        }
    },
    {
        name: 'triplet',
        compose: (weapon, owner) => {
            weapon.components.push(new Cannon(owner, { y: 0.5, delay: owner.reloadSpeed / 2 }));
            weapon.components.push(new Cannon(owner, { y: -0.5, delay: owner.reloadSpeed / 2 }));
            weapon.components.push(new Cannon(owner, { width: 1, length: 1.6 }));
        }
    },
    {
        name: 'minigun',
        compose: (weapon, owner) => {
            weapon.components.push(new Cannon(owner, { reloadSpeed: 0.5, width: 0.4, y: 0.25 }));
            weapon.components.push(new Cannon(owner, { reloadSpeed: 0.5, width: 0.4, y: -0.25 }));
            weapon.components.push(new Cannon(owner, { reloadSpeed: 0.5, width: 0.4, y: 0.7, length: 1.3, delay: owner.reloadSpeed / 2 }));
            weapon.components.push(new Cannon(owner, { reloadSpeed: 0.5, width: 0.4, y: -0.7, length: 1.3, delay: owner.reloadSpeed / 2 }));
        }
    },
];

module.exports = class Weapon {

    constructor(owner, type) {
        this.type = type;
        this.firing = false;
        this.components = [];
        (weaponList.find(w => w.name === type) || weaponList[0]).compose(this, owner);
    }

    getData() {
        return this.components.map(c => c.getData());
    }

    setData(data) {
        this.components.forEach((c, i) => c.setData(data[i]));
    }

    update(deltaTime, game) {
        this.components.forEach(c => c.update(deltaTime, game));
    }

    render(ctx, game) {
        this.components.forEach(c => c.render(ctx, game));
    }

}

module.exports.weaponList = weaponList;
