/**
 * Convert number to BN
 * @param {number|string} value
 * @returns {Object<BN>}
 */
const toBN = x => web3.utils.toBN(x);
module.exports.toBN = toBN;

/**
 * Convert Wei to BN
 * @param {number|string} value
 * @returns {Object<BN>}
 */
const toWeiBN = x => web3.utils.toBN(web3.utils.toWei(x, 'ether'));
module.exports.toWeiBN = toWeiBN;

/**
 * Calculates unsigned integer square root
 * @param {number|Object<BN>} value
 * @returns {Object<BN>}
 */
module.exports.isqrt = value => {
    value = web3.utils.isBN(value) ? value : toBN(value);
    let z = value.add(toBN(1)).div(toBN(2));
    let y = value;
    
    while (z.lt(y)) {
        y = z;
        z = value.div(z).add(z).div(toBN(2));
    }

    return y;
};