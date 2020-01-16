const { ganache, defaults } = require('../helpers/ganache');
const { assertFailure } = require('../helpers/assertions');
const setupDao = require('../helpers/setupDao');
const { encodeCall } = require('@openzeppelin/upgrades');
const packageJson = require('../../package.json');

// Contracts schemas 
const ProxyAdminSchema = require('@openzeppelin/upgrades/build/contracts/ProxyAdmin.json');
const DaoSchema = require('@dao/contracts/artifacts/Dao.json');

// Test targets
const version = require('../../src/commands/version');
const createDao = require('../../src/commands/createdao');
const getProxyAminOwner = require('../../src/commands/getproxyadminowner');
const getProxyImplementation = require('../../src/commands/getproxyimplementation');
const publishProposal = require('../../src/commands/proposal');

require('chai').should();

describe('Commands', () => {
    const wrongAddress = '0x6C12f4A31A1A4b4257fFB77f553156165B827822';
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    let server;
    let initialDaoOwner;
    let proposer;
    let proposer2;
    let adminAddress;
    let dao;
    let token;
    let proxyImplementation;

    beforeEach(async () => {
        server = await ganache(defaults);
        const accounts = await web3.eth.getAccounts();
        initialDaoOwner = accounts[1];
        proposer = accounts[2];
        proposer2 = accounts[3];

        // Setup testing environment
        const setup = await setupDao(
            initialDaoOwner,
            [proposer]
        );
        
        dao = setup.dao;
        token = setup.token;
        adminAddress = setup.adminAddress;
        proxyImplementation = setup.proxyImplementation;
    });

    afterEach(() => server.close());

    describe('#version', () => {

        it('shoukd return cli version number', async () => {
            (await version()).should.equal(packageJson.version);
        });
    });

    describe('#createdao', () => {

        it('should fail if wrong or zero owner address provided', async () => {
            await assertFailure(
                createDao(wrongAddress, token.address, [initialDaoOwner]),
                'sender account not recognized'
            );
            await assertFailure(
                createDao(zeroAddress, token.address, [initialDaoOwner]),
                'sender account not recognized'
            );
        });

        it('should fail if wrong governance token address provided', async () => {
            await assertFailure(
                createDao(initialDaoOwner, wrongAddress, [initialDaoOwner]),
                'no code at address'
            );
        });

        it('should fail if no proposers has been provided', async () => {
            await assertFailure(
                createDao(initialDaoOwner, token.address),
                'PROPOSERS_ARE_NOT_DEFINED'
            );
        });

        it('should create new dao', async () => {
            const setup = await createDao(initialDaoOwner, token.address, [initialDaoOwner]);

            (web3.utils.isAddress(setup.proxyAddress)).should.be.true;
            (setup.token.address).should.equal(token.address);
            (web3.utils.isAddress(setup.adminAddress)).should.be.true;
            (setup.adminOwnerAddress).should.equal(setup.proxyAddress);// Dao should own itself
            (web3.utils.isAddress(setup.proxyImplementation)).should.be.true;
        });
    });

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

    describe('#proposal', () => {
        let proposal;

        beforeEach(async () => {

            proposal = {
                details: 'Add new proposer address to white list',
                proposalType: 0,
                duration: 10,
                destination: dao.address,
                value: 0,
                callName: 'addWhitelisted', 
                callTypes: ['address'], 
                callValues: [proposer2]                
            };
        });

        it('should fail if wrong dao address has been provided', async () => {
            await assertFailure(
                publishProposal(
                    DaoSchema,
                    wrongAddress,
                    proposal,
                    proposer
                ),
                'no code at address'
            );
        });

        it('should fail if wrong proposal type has been provided', async () => {
            proposal.proposalType = 3;
            await assertFailure(
                publishProposal(
                    DaoSchema,
                    dao.address,
                    proposal,
                    proposer
                ),
                'VM Exception while processing transaction: revert'
            );
        });

        it('should fail if wrong proposal eth value has been provided', async () => {
            proposal.value = 'not_a_value';
            await assertFailure(
                publishProposal(
                    DaoSchema,
                    dao.address,
                    proposal,
                    proposer
                ),
                'invalid number value'
            );
        });

        it('should add new proposal', async () => {
            const proposalId = await publishProposal(
                DaoSchema,
                dao.address,
                proposal,
                proposer
            );
            const addedProposal = await dao.methods['getProposal(uint256)'](proposalId).call();
            (addedProposal.details).should.equal(proposal.details);
            (addedProposal.proposalType).should.equal(proposal.proposalType.toString());
            (addedProposal.duration).should.equal(proposal.duration.toString());
            (addedProposal.flags).should.deep.equal([false, false, false]);
            (addedProposal.txDestination).should.equal(proposal.destination);
            (addedProposal.txValue).should.equal(proposal.value.toString());
            (addedProposal.txData).should.equal(encodeCall(
                proposal.callName, 
                proposal.callTypes, 
                proposal.callValues
            ));
            (addedProposal.txExecuted).should.equal(false);
            (addedProposal.txSuccess).should.equal(false);
        });
    });
});
