"use strict";

global.web3 = web3;

const {
  parseArgv,
  parseParams
} = require('./utils/cli'); // Commands modules


const version = require('./commands/version');

const createToken = require('./commands/token');

const createDao = require('./commands/createdao');

const getProxyAdminOwner = require('./commands/getproxyadminowner');

const getProxyImplementation = require('./commands/getproxyimplementation');

const proposal = require('./commands/proposal');

const ProxyAdminSchema = require('@openzeppelin/upgrades/build/contracts/ProxyAdmin.json');

const DaoSchema = require('@dao/contracts/artifacts/Dao.json'); // Truffle script body


const main = async () => {
  const args = parseArgv(process.argv, 6);

  switch (args.cmd) {
    case 'version':
      await version();
      break;

    case 'token':
      await createToken(args.owner, parseParams(args.holders), parseParams(args.values));
      break;

    case 'createdao':
      await createDao(args.owner, args.token, parseParams(args.proposers));
      break;

    case 'getproxyadminowner':
      await getProxyAdminOwner(ProxyAdminSchema, args.address);
      break;

    case 'getproxyimplementation':
      await getProxyImplementation(ProxyAdminSchema, args.address, parseParams(args.params)[0]);
      break;

    case 'proposal':
      const proposalParams = parseParams(args.params); //eslint-disable-line no-case-declarations

      await proposal(DaoSchema, args.address, {
        details: proposalParams[0],
        proposalType: proposalParams[1],
        duration: proposalParams[2],
        destination: proposalParams[3],
        value: proposalParams[4],
        callName: args.callname,
        callTypes: parseParams(args.calltypes),
        callValues: parseParams(args.callvalues)
      }, args.proposer);
      break;

    case 'processproposal':
      break;

    default:
      throw new Error('UNKNOWN_COMMAND');
  }
};

module.exports = callback => main().then(() => callback()).catch(err => callback(err));