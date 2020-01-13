const { ganache, defaults } = require('../helpers/ganache');
const { assertFailure } = require('../helpers/assertions');
const setupDao = require('../helpers/setupDao');
const ProxyAdminSchema = require('@openzeppelin/upgrades/build/contracts/ProxyAdmin.json');

// Test targets
const getProxyAminOwner = require('../../src/commands/getproxyadminowner');
const getProxyImplementation = require('../../src/commands/getproxyimplementation');

require('chai').should();

describe('Commands', () => {
    const wrongAddress = '0x6C12f4A31A1A4b4257fFB77f553156165B827822';
    let server;
    let initialDaoOwner;
    let adminAddress;
    let dao;
    let proxyImplementation;

    beforeEach(async () => {
        server = await ganache(defaults);
        const accounts = await web3.eth.getAccounts();
        initialDaoOwner = accounts[1];

        // Setup testing environment
        const setup = await setupDao(
            initialDaoOwner
        );
        
        dao = setup.dao;
        adminAddress = setup.adminAddress;
        proxyImplementation = setup.proxyImplementation;
    });

    afterEach(() => server.close());

    describe('#getproxyadminowner', () => {
            
        it('should fail if wrong admin address provided', async () => {
            await assertFailure(
                getProxyAminOwner(ProxyAdminSchema, wrongAddress),
                'no code at address'
            );
        });
    
        it('should return proxy admin owner address', async () => {
            (await getProxyAminOwner(ProxyAdminSchema, adminAddress)).should.equal(initialDaoOwner);
        });
    });

    describe('#getproxyimplementation', () => {
            
        it('should fail if wrong admin address provided', async () => {
            await assertFailure(
                getProxyImplementation(ProxyAdminSchema, wrongAddress, dao.address),
                'no code at address'
            );
        });

        it('should fail if wrong proxy address provided', async () => {
            await assertFailure(
                getProxyImplementation(ProxyAdminSchema, adminAddress, wrongAddress),
                'VM Exception while processing transaction: revert'
            );
        });
    
        it('should return proxy implementation address', async () => {
            (await getProxyImplementation(
                ProxyAdminSchema, 
                adminAddress, 
                dao.address
            )).should.equal(proxyImplementation);
        });
    });
});
