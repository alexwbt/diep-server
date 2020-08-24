const GameObject = require('.');
const { radians } = require('../maths');
const { REGULAR_POLYGON, defaultValue, POLYGON } = require('../constants');

module.exports = class RegularPolygon extends GameObject {

    constructor(initInfo) {
        super({
            ...initInfo,
            shape: POLYGON,
            objectType: REGULAR_POLYGON
        });
        if (initInfo) {
            this.vertices = defaultValue(initInfo.vertices, 3);
        }
    }

    getInfo() {
        return super.getInfo().concat([
            this.vertices
        ]);
    }

    setInfo(info) {
        let i = super.setInfo(info);
        this.vertices = info[i++];
        return i;
    }

    getVertices(game, radiusMultiply = 1) {
        const vertices = [];
        for (let i = 0; i < this.vertices; i++) {
            const dir = Math.PI * 2 / this.vertices * i + radians(this.rotate);
            const x = this.x + Math.cos(dir) * this.radius * radiusMultiply;
            const y = this.y + Math.sin(dir) * this.radius * radiusMultiply;
            vertices.push(game ? game.onScreen(x, y) : { x, y });
        }
        return vertices;
    }

    onScreen(game) {
        return {
            ...super.onScreen(game),
            vertices: this.getVertices(game)
        };
    }

    render(ctx, game) {
        const { x, y, radius, onScreen, vertices } = this.onScreen(game);
        if (!onScreen) return;
        ctx.globalAlpha = this.alpha;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++)
            ctx.lineTo(vertices[i].x, vertices[i].y);
        ctx.closePath();
        ctx.fill();

        const borderVertices = this.getVertices(game, 1 - this.borderWidth / 2);
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = this.radius * this.borderWidth * game.scale;
        ctx.beginPath();
        ctx.moveTo(borderVertices[0].x, borderVertices[0].y);
        for (let i = 1; i < borderVertices.length; i++)
            ctx.lineTo(borderVertices[i].x, borderVertices[i].y);
        ctx.closePath();
        ctx.stroke();

        this.healthBarRender(ctx, x, y, radius);
        ctx.globalAlpha = 1;
    }

}
