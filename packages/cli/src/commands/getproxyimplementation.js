const { createContract } = require('../utils/contracts');
const { log } = require('../utils/stdout');

module.exports = async (
    proxyAdminSchema,
    proxyAdminAddress,
    proxyAddress
) => {
    // Initialize proxy admin contract instance
    const proxyAdminContract = createContract(proxyAdminSchema);
    const proxyAdminInstance = await proxyAdminContract.at(proxyAdminAddress);

    // Get proxy owner address
    const proxyImplementation = await proxyAdminInstance.methods['getProxyImplementation(address)'].call(proxyAddress);
    log('Proxy Implementation', proxyImplementation, true);

    return proxyImplementation;
};
