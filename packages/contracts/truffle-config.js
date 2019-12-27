const HDWalletProvider = require('truffle-hdwallet-provider');
const NonceTrackerSubprovider = require('web3-provider-engine/subproviders/nonce-tracker');

let pkey = process.env.ETH_PRIVATE_KEY;
let apiKey = process.env.INFURA_API_KEY;

try {
    const keys = require('./localkeys.json');
    pkey = keys.pkey;
    apiKey = keys.infuraApiKey;
} catch (e) {
    console.log('Keys not found or localkeys.json file is corrupt');// eslint-disable-line no-console
}

module.exports = {

    plugins: [
        'solidity-coverage'
    ],

    contracts_build_directory: './artifacts',

    networks: {
        ganache: {
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
            gas: 5500000,
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
