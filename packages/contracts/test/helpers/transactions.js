const { encodeCall } = require('@openzeppelin/upgrades');

/**
 * Build callData for transaction
 * @param {string} method Method to be called
 * @param {*[]} methodParamTypes Array of method parameters
 * @param {*[]} methodParams Array of method parameters
 * @returns {string} callData string
 */
const buildCallData = (method, methodParamTypes, methodParams) => {
    return encodeCall(method, methodParamTypes, methodParams);
};
module.exports.buildCallData = buildCallData;