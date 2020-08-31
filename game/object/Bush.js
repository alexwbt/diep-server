const GameObject = require('.');
const { BUSH } = require('../constants');

module.exports = class Bush extends GameObject {

    constructor(initInfo) {
        super({
            radius: Math.random() * 50 + 50,
            borderWidth: 0.1,
            ...initInfo,
            objectType: BUSH,
            color: '#339944ff'
        });
    }

}
