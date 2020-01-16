"use strict";

const {
  createContract
} = require('../utils/contracts');

const {
  log
} = require('../utils/stdout');

module.exports = async (proxyAdminSchema, proxyAdminAddress) => {
  // Initialize proxy admin contract instance
  const proxyAdminContract = createContract(proxyAdminSchema);
  const proxyAdminInstance = await proxyAdminContract.at(proxyAdminAddress); // Get proxy owner address

  const proxyAdminOwnerAddress = await proxyAdminInstance.methods['owner()'].call();
  log('Proxy Admin Owner', proxyAdminOwnerAddress, true);
  return proxyAdminOwnerAddress;
};