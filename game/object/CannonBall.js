const GameObject = require(".");

module.exports = class CannonBall extends GameObject {

    getData() {
        return {
            ...super.getData(),
            lifeTime: this.lifeTime,
            ownerId: this.ownerId,
            objectType: 'CannonBall'
        };
    }

    setData(data) {
        super.setData(data);
        this.lifeTime = data.lifeTime;
        this.ownerId = data.ownerId;
    }

    getName(game) {
        const owner = game.objects.find(object => object.objectId === this.ownerId);
        return owner && owner.name;
    }

    differentTeam(otherObject) {
        return super.differentTeam(otherObject)
            && this.ownerId !== otherObject.objectId
            && this.ownerId !== otherObject.ownerId;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.lifeTime -= deltaTime;
        if (this.lifeTime <= 0) {
            this.removed = true;
        }
    }

}
