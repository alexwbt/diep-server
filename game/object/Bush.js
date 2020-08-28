const GameObject = require('.');
const { pointInCircle } = require('../collisions');
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

    render(ctx, game) {
        const { x, y, radius, onScreen } = this.onScreen(game);
        if (!onScreen) return;

        if (pointInCircle(game.camera, this))
            ctx.globalAlpha = 0.5;

        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = this.borderWidth * radius;
        ctx.beginPath();
        const step = 10 * Math.PI / 180;
        for (let i = 0; i < 36; i++) {
            const vertX = x + Math.cos(i * step) * (i % 2 === 0 ? radius * 0.95 : radius);
            const vertY = y + Math.sin(i * step) * (i % 2 === 0 ? radius * 0.95 : radius);
            if (i === 0) ctx.moveTo(vertX, vertY);
            else ctx.lineTo(vertX, vertY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha = 1;
    }

}
