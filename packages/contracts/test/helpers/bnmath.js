const { toBN } = require('./common');

/**
 * Calculates unsigned integer square root
 * @param {number|Object<BN>} value
 * @returns {Object<BN>}
 */
module.exports.isqrt = value => {
    value = toBN(value);
    let z = value.add(toBN(1)).div(toBN(2));
    let y = value;
    
    while (z.lt(y)) {
        y = z;
        z = value.div(z).add(z).div(toBN(2));
    }

    return y;
};