const GameObject = require('.');
const { radians } = require('../maths');

module.exports = class RegularPolygon extends GameObject {

    /**
     * RegularPolygon Constructor
     * @param {*} info - Object info.
     * @param {number} vertices - Number of vertices.
     */
    constructor(info, vertices) {
        super(info);
        this.shape = 'polygon';
        this.vertices = vertices;
    }

    getData() {
        return {
            ...super.getData(),
            shape: 'polygon',
            vertices: this.vertices,
            objectType: 'RegularPolygon'
        };
    }

    setData(data) {
        super.setData(data);
        this.shape = 'polygon';
        this.vertices = data.vertices;
    }

    getVertices() {
        const vertices = [];
        for (let i = 0; i < this.vertices; i++) {
            const dir = Math.PI * 2 / this.vertices * i + radians(this.rotate);
            const x = this.x + Math.cos(dir) * this.radius;
            const y = this.y + Math.sin(dir) * this.radius;
            vertices.push({ x, y });
        }
        return vertices;
    }

}
