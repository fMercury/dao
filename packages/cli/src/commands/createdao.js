const { log } = require('../utils/stdout');
const setupDao = require('../../test/helpers/setupDao');

module.exports = async (
    initialDaoOwner,
    tokenAddress,
    proposers
) => {

    // Setup Dao
    const setup = await setupDao(
        initialDaoOwner,
        proposers,
        [],
        tokenAddress,
        true
    );

    log('Dao', setup.proxyAddress, true);
    log('Governance Token', setup.token.address, false);
    log('Proxy Admin', setup.adminAddress, false);
    log('Proxy Admin Owner', setup.adminOwnerAddress, false);
    log('Proxy Implementation', setup.proxyImplementation, false);

    return setup;
};