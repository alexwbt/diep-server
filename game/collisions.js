const { closerThan, pythagorean } = require('./maths');
const { CIRCLE, AABB, POLYGON } = require('./constants');

const collision = (object1, object2) => {
    switch (`${object1.shape}:${object2.shape}`) {
        case `${CIRCLE}:${CIRCLE}`: return circleVsCircle(object1, object2);
        case `${AABB}:${AABB}`: return aabbVsAABB(object1, object2);
        case `${POLYGON}:${POLYGON}`: return polygonVsPolygon(object1.getVertices(), object2.getVertices());

        case `${CIRCLE}:${AABB}`: return circleVsAABB(object1, object2);
        case `${AABB}:${CIRCLE}`: return circleVsAABB(object2, object1);

        case `${CIRCLE}:${POLYGON}`: return circleVsPolygon(object1, object2.getVertices());
        case `${POLYGON}:${CIRCLE}`: return circleVsPolygon(object2, object1.getVertices());
        default: return false;
    }
};

/**
 * Returns true if point is within circle.
 * @param {{x: number, y: number}} point 
 * @param {{x: number, y: number, radius: number}} circle 
 */
const pointInCircle = (point, circle) => closerThan(point, circle, circle.radius);

/**
 * Returns true if circle1 is within circle2.
 * @param {{x: number, y: number, radius: number}} point 
 * @param {{x: number, y: number, radius: number}} circle 
 */
const circleInCircle = (circle1, circle2) => closerThan(circle1, circle2, circle2.radius - circle1.radius);

/**
 * Returns true if point is within polygon.
 * @param {{x: number, y: number}} point 
 * @param {{x: number, y: number}[]} polygon 
 */
const pointInPolygon = (point, polygon) => {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++)
        if ((polygon[i].y > point.y) !== (polygon[j].y > point.y)
            && (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x))
            result = !result;
    return result;
};

/**
 * Returns true if circle is overlapping line.
 * @param {{x: number, y: number, radius: number}} circle 
 * @param {{x: number, y: number}} p1 - First point of line.
 * @param {{x: number, y: number}} p2 - Second point of line.
 */
const circleVsLine = (circle, p1, p2) => {
    if (!circleVsAABB(circle, {
        a: { x: Math.min(p1.x, p2.x), y: Math.min(p1.y, p2.y) },
        b: { x: Math.max(p1.x, p2.x), y: Math.max(p1.y, p2.y) }
    })) return false;
    return Math.pow(circle.radius * pythagorean((p2.x - circle.x) - (p1.x - circle.x), (p2.y - circle.y) - (p1.y - circle.y)), 2)
        - Math.pow((p1.x - circle.x) * (p2.y - circle.y) - (p2.x - circle.x) * (p1.y - circle.y), 2) >= 0;
};

/**
 * Returns true if circle1 collides with circle2.
 * @param {{x: number, y: number, radius: number}} circle1 
 * @param {{x: number, y: number, radius: number}} circle2 
 */
const circleVsCircle = (circle1, circle2) => closerThan(circle1, circle2, circle1.radius + circle2.radius);

/**
 * Returns true if AABB1 collides with AABB2.
 * @param {{a: {x: number, y: number}, b: {x: number, y: number}}} aabb1 
 * @param {{a: {x: number, y: number}, b: {x: number, y: number}}} aabb2 
 */
const aabbVsAABB = (aabb1, aabb2) =>
    aabb1.a.x < aabb2.b.x &&
    aabb1.b.x > aabb2.a.x &&
    aabb1.a.y < aabb2.b.y &&
    aabb1.b.y > aabb2.a.y;

/**
 * Returns true if p1 collides with p2.
 * @param {{x: number, y: number}[]} p1 - First polygon.
 * @param {{x: number, y: number}[]} p2 - Second polygon.
 */
const polygonVsPolygon = (p1, p2) => {
    for (const p of p1)
        if (pointInPolygon(p, p2))
            return true;
    for (const p of p2)
        if (pointInPolygon(p, p1))
            return true;
    return false;
};

/**
 * Returns true if circle collides with AABB.
 * @param {{x: number, y: number, radius: number}} circle 
 * @param {{a: {x: number, y: number}, b: {x: number, y: number}}} aabb 
 */
const circleVsAABB = (circle, aabb) => {
    const x = Math.min(aabb.b.x, Math.max(aabb.a.x, circle.x));
    const y = Math.min(aabb.b.y, Math.max(aabb.a.y, circle.y));
    return pointInCircle({ x, y }, circle);
};

/**
 * Returns true if circle collides with polygon.
 * @param {{x: number, y: number, radius: number}} circle 
 * @param {{x: number, y: number}[]} polygon 
 */
const circleVsPolygon = (circle, polygon) => {
    for (let i = 0; i < polygon.length; i++)
        if (circleVsLine(circle, polygon[i], polygon[(i + 1) % polygon.length]))
            return true;
    return pointInPolygon(circle, polygon);
};

module.exports = {
    collision,
    circleInCircle,
    pointInCircle
};
