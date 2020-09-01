
// object types
const GAME_OBJECT = 0;
const REGULAR_POLYGON = 1;
const TANK = 2;
const CANNON_BALL = 3;
const WEAPON_BALL = 4;
const HEAL_BALL = 5;
const SHIELD_BALL = 6;
const BUSH = 7;
const AD_TANK = 8;
const AD_TANK_BALL = 9;
const GRENADE = 10;

// shapes
const CIRCLE = 0;
const POLYGON = 1;
const AABB = 2;

// color
const color = value => '#' + value.toString(16).padStart(8, 0);
const colorValue = color => parseInt(color.replace(/#/, '0x'));

// default value
const defaultValue = (value, defaultValue) =>
    typeof value === 'undefined' ? defaultValue : value;

module.exports = {
    GAME_OBJECT,
    REGULAR_POLYGON,
    TANK,
    CANNON_BALL,
    WEAPON_BALL,
    HEAL_BALL,
    SHIELD_BALL,
    BUSH,
    AD_TANK,
    AD_TANK_BALL,
    GRENADE,

    CIRCLE,
    POLYGON,
    AABB,

    color,
    colorValue,
    defaultValue
};
