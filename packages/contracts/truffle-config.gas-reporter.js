module.exports = {
    networks: {
        ganache: {
            host: '127.0.0.1',
            port: 8545,
            network_id: '*',
            gas: 8000000// Like in Ropsten network
        }
    },

    mocha: {
        enableTimeouts: false,
        reporter: 'eth-gas-reporter',
        reporterOptions : {
            excludeContracts: [
                'Migrations'
            ]
        }
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
