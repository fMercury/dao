"use strict";

const {
  title,
  log
} = require('../utils/stdout');

const setupDao = require('../../test/helpers/setupDao');

module.exports = async (initialDaoOwner, tokenAddress, proposers) => {
  title('New Dao creation and deployment'); // Setup Dao

  const setup = await setupDao(initialDaoOwner, proposers, [], tokenAddress, true);
  log('Dao', setup.proxyAddress);
  log('Governance Token', setup.token.address);
  log('Proxy Admin', setup.adminAddress);
  log('Proxy Admin Owner', setup.adminOwnerAddress);
  log('Proxy Implementation', setup.proxyImplementation);
  return setup;
};