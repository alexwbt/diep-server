
// object types
let i = 0;
const GAME_OBJECT = i++;
const REGULAR_POLYGON = i++;
const TANK = i++;
const CANNON_BALL = i++;
const BUSH = i++;
const AD_TANK = i++;
const MISSILE = i++;
const ROCKET = i++;
const GRAVITY_FIELD = i++;

// item ball object types
const WEAPON_BALL = i++;
const HEAL_BALL = i++;
const SHIELD_BALL = i++;
const AD_TANK_BALL = i++;
const GRENADE = i++;

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
    MISSILE,
    ROCKET,
    GRAVITY_FIELD,

    CIRCLE,
    POLYGON,
    AABB,

    color,
    colorValue,
    defaultValue
};
