const { parseArgv, parseParams } = require('./utils/cli');
const createDao = require('./commands/createdao');
const getProxyAdminOwner = require('./commands/getproxyadminowner');
const getProxyImplementation = require('./commands/getproxyimplementation');
const proposal = require('./commands/proposal');

const ProxyAdminSchema = require('@openzeppelin/upgrades/build/contracts/ProxyAdmin.json');
const DaoSchema = require('@dao/contracts/artifacts/Dao.json');

// Truffle script body
const main = async () => {
    const args = parseArgv(process.argv, 6);
    const params = parseParams(args);

    switch (args.cmd) {
        case 'createdao':
            await createDao(args.owner, args.token, parseParams(args.proposers));
            break;

        case 'getproxyadmin':
            await getProxyAdminOwner(ProxyAdminSchema, args.address);
            break;

        case 'getimplementation':
            await getProxyImplementation(ProxyAdminSchema, args.address, params[0]);
            break;

        case 'proxyadminchange':
            break;

        case 'upgrade':
            break;

        case 'upgradeandcall':
            break;

        case 'pause':
            break;

        case 'whitelist':
            break;

        case 'proposal':
            await proposal(
                DaoSchema,
                args.address,
                {
                    details: params[0],
                    proposalType: params[1],
                    duration: params[2],
                    destination: params[3],
                    value: params[4],
                    callName: args.callname, 
                    callTypes: parseParams(args.calltypes), 
                    callValues: parseParams(args.callvalues)
                },
                args.proposer
            );
            break;

        case 'processproposal':
            break;

        default:
            throw new Error('UNKNOWN_COMMAND');
    }
};

module.exports = callback => main()
    .then(() => callback())
    .catch(err => callback(err));