"use strict";

const {
  encodeCall
} = require('@openzeppelin/upgrades');

const {
  createContract
} = require('../utils/contracts');

const {
  title,
  log
} = require('../utils/stdout');

module.exports = async (daoSchema, daoAddress, options = {}, from) => {
  // Initialize Dao instance
  const daoContract = createContract(daoSchema);
  const daoInstance = await daoContract.at(daoAddress);
  title('Creating of the proposal');
  return await new Promise((resolve, reject) => {
    // Create new proposal
    daoInstance.methods['addProposal(string,uint8,uint256,address,uint256,bytes)'].sendTransaction(options.details, options.proposalType, options.duration, options.destination, options.value, encodeCall(options.callName, options.callTypes, options.callValues), {
      value: options.value,
      from
    }).on('error', reject).on('transactionHash', th => log('Tx Hash', th, false)).then(receipt => {
      let events = receipt.logs.filter(l => l.event === 'ProposalAdded');
      const proposalId = events[0].args.proposalId.toString();
      log('Proposal created with Id', proposalId);
      title('Proposal parameters');
      log('Details', options.details);
      log('Proposal type', options.proposalType);
      log('Duration', options.duration);
      log('Destination', options.destination);
      log('Call name', options.callName);
      resolve(proposalId);
    }).catch(reject);
  });
};