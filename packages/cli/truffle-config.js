const HDWalletProvider = require('@truffle/hdwallet-provider');
const NonceTrackerSubprovider = require('web3-provider-engine/subproviders/nonce-tracker');

let pkey = process.env.ETH_PRIVATE_KEY;
let apiKey = process.env.INFURA_API_KEY;
let keys;

if (!process.env.COVERAGE && !process.env.TESTING) {

    try {
        keys = require('./localkeys.json');
        pkey = keys.pkey;
        apiKey = keys.infuraApiKey;
    } catch (e) {
        console.log('Keys not found or localkeys.json file is corrupt');// eslint-disable-line no-console
    }
}

module.exports = {

    networks: {
        ganache: {
            provider: _ => new HDWalletProvider(pkey, 'http://localhost:8545'),
            host: '127.0.0.1',
            port: 8545,
            network_id: '*',
            gas: 8000000// Like in Ropsten network
        },
        infura_ropsten: {
            provider: _ => {// eslint-disable-line no-unused-vars
                const provider = new HDWalletProvider(pkey, `https://ropsten.infura.io/v3/${apiKey}`);
                const nonceTracker = new NonceTrackerSubprovider();
                provider.engine.addProvider(nonceTracker);
                return provider;
            },
            network_id: 3,
            gas: 8000000,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },
    },

    mocha: {
        enableTimeouts: false,
        // reporter: 'eth-gas-reporter',
        // reporterOptions : {
        //     excludeContracts: [
        //         'Migrations'
        //     ]
        // }
        // timeout: 100000
    },

    compilers: {
        solc: {
            version: '0.5.14',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
};
