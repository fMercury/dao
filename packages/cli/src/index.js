const { parseArgv, parseParams } = require('./utils/cli');
const getProxyAdminOwner = require('./commands/getproxyadminowner');
const getProxyImplementation = require('./commands/getproxyimplementation');

const ProxyAdminSchema = require('@openzeppelin/upgrades/build/contracts/ProxyAdmin.json');
const DaoSchema = require('@dao/contracts/artifacts/Dao.json');

// Truffle script body
const main = async () => {
    const args = parseArgv(process.argv, 6);
    const params = parseParams(args);

    if (!args.address) {
        throw new Error('DAO_ADDREESS_NOT_SPECIFIED');
    }

    switch (args.cmd) {
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