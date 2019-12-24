/**
 * Convert number to BN
 * @param {string} value
 * @returns {Object<BN>}
 */
const toBN = x => web3.utils.isBN(x) ? x : web3.utils.toBN(x);
module.exports.toBN = toBN;

/**
 * Convert Wei to BN
 * @param {string} value
 * @returns {Object<BN>}
 */
const toWeiBN = x => web3.utils.toBN(web3.utils.toWei(x, 'ether'));
module.exports.toWeiBN = toWeiBN;