require('chai')
    .use(require('bn-chai')(web3.utils.BN))
    .should();

const {
    zeroAddress, 
    ProposalType
} = require('./helpers/constants');
const assertRevert = require('./helpers/assertRevert');
const { TestHelper } = require('@openzeppelin/cli');
const { Contracts, ZWeb3 } = require('@openzeppelin/upgrades');

Contracts.setLocalBuildDir('./artifacts');

// workaround for https://github.com/zeppelinos/zos/issues/704
Contracts.setArtifactsDefaults({
    gas: 8000000,
});

ZWeb3.initialize(web3.currentProvider);

const Erc20Token = Contracts.getFromLocal('Erc20Token');
const Dao = Contracts.getFromLocal('Dao');

contract('DAO', accounts => {
    const tokenOwner = accounts[1];
    const initialProxyOwner = accounts[3];
    const proposalCreator1 = accounts[4];
    const proposalCreator2 = accounts[5];
    const voter1 = accounts[5];
    const voter2 = accounts[6];
    const voter3 = accounts[7];
    const voter4 = accounts[8];
    const voter5 = accounts[9];

    // values in ether
    const tokensDistribution = [
        {
            owner: voter1,
            value: '10'
        },
        {
            owner: voter2,
            value: '20'
        },
        {
            owner: voter3,
            value: '50'
        },
        {
            owner: voter4,
            value: '10'
        },
        // voter5 will still with empty balance
    ];

    let token;
    let project;
    let dao;

    beforeEach(async () => {
        // Create service token instance
        token = await Erc20Token.new('Test Coin', 'TEST', 18, web3.utils.toWei('1000000000', 'ether'), {
            from: tokenOwner
        });

        // Transfer initial amount of tokens to voters
        await Promise.all(tokensDistribution.map(
            v => token.methods['transfer(address,uint256)'](
                v.owner, 
                web3.utils.toWei(v.value, 'ether')
            ).send({
                from: tokenOwner
            })
        ));
        
        // Create upgradeability project
        project = await TestHelper({
            from: initialProxyOwner
        });

        // DAO instance
        dao = await project.createProxy(Dao, {
            initArgs: [token.address]
        });

        // Add first proposals creator address to white-list
        await dao.methods['addWhitelisted(address)'](proposalCreator1).send({
            from: initialProxyOwner
        });

        // Grant ability to manage white-list to DAO itself only
        await dao.methods['replaceWhitelistAdmin(address)'](dao.address).send({
            from: initialProxyOwner
        });
        
        // Grant ability to manage Pausable state to DAO itself only
        await dao.methods['replacePauser(address)'](dao.address).send({
            from: initialProxyOwner
        });

        // Grant ability to upgrade DAO contract to DAO itself only
        await project.transferAdminOwnership(dao.address);
    });

    describe('#addProposal(string,uint8,uint256,address,uint256,bytes)', () => {

        it('should fail if sender address not whitelisted', async () => {});

        it('should fail if contract in a paused state', async () => {});

        it('should fail if proposal type has unknown value', async () => {});

        it('should fail if destination target address equal to zero', async () => {});

        it('should fail if sender has insufficient balance', async () => {});

        it('should fail if transaction data not valid', async () => {});

        it('should add new proposal', async () => {});        
    });

    describe('#cancelProposal(uint256)', () => {

        beforeEach(async () => {
            // Add proposal
        });

        it('should fail if sender address not a proposer address', async () => {});

        it('should fail if proposal in a passed state', async () => {});

        it('should fail if proposal cancelled', async () => {});
        
        it('should cancel proposal', async () => {});
    });

    describe('#vote(uint256,uint256)', () => {

        beforeEach(async () => {
            // Add proposal
        });

        it('should fail if contract is paused', async () => {});

        it('should fail if reentrant call detected', async () => {});

        it('should fail if proposal in a passed state', async () => {});

        it('should fail if proposal cancelled', async () => {});

        it('should fail if sender tokens balance insufficient', async () => {});

        it('should fail if tokens allowance for the DAO address insufficient', async () => {});

        it('should fail if already enough votes in voting', async () => {});

        it('should fail if voting is expired', async () => {});

        it('should accept a vote', async () => {});
    });

    describe('#revokeVote(uint256)', () => {

        beforeEach(async () => {
            // Add proposal
            // Add a vote for proposal
        });

        it('should fail if proposal in a passed state', async () => {});

        it('should fail if proposal cancelled', async () => {});

        it('should revoke a vote', async () => {});
    });

    describe('#processProposal(uint256)', () => {

        describe('In a case of the voting success', () => {

            beforeEach(async () => {
                // Add proposal
                // Fulfil voting (to success result)
            });

            it('should fail if contract is paused', async () => {});
    
            it('should fail if sender address not a proposer address', async () => {});
    
            it('should fail if proposal processed', async () => {});
    
            it('should fail if proposal cancelled', async () => {});
    
            it('should process a proposal', async () => {});
        });
        
        describe('In a case of the voting failure', () => {

            beforeEach(async () => {
                // Add proposal
                // Fulfil voting (to failure result)
            });

            it('should fail if contract is paused', async () => {});
    
            it('should process a proposal', async () => {});
        });
    });

    describe('#tokensBalance()', () => {

        it('should return 0 if votes are not been placed', async () => {});

        it('should return released tokens balance', async () => {
            // Add proposal
            // Vote for proposal
            // Revoke a vote
        });
    });

    describe('#withdrawTokens()', () => {

        it('should fail if sender has empty released tokens balance', async () => {});

        it('should fail if reentrant call detected', async () => {});

        describe('In a case of the voting success', () => {

            beforeEach(async () => {
                // Add proposal
                // Fulfil voting (to success result)
            });

            it('should widthdraw released tokens', async () => {});
        });

        describe('In a case of the voting failure', () => {

            beforeEach(async () => {
                // Add proposal
                // Fulfil voting (to failure result)
            });
            
            it('should widthdraw released tokens', async () => {});
        });

        describe('In a case of expired voting', () => {

            beforeEach(async () => {
                // Add proposal
                // rewind time out of frame
            });
            
            it('should widthdraw released tokens', async () => {});
        });        
    });

    describe('#getProposal(uint256)', () => {

        it('should fail if proposal not found', async () => {});
    
        it('should return a proposal', async () => {});
    });

    describe('#getActiveProposalsIds()', () => {

        describe('In a case when proposals has not been added at all', () => {

            it('should return empty array', async () => {});
        });

        describe('In a case when registered proposals are exists', () => {

            beforeEach(async () => {
                // Add 2 proposals
            });

            it('should return empty array if all proposals in a passed state', async () => {            
                // Fulfil first voting to success result
                // Fulfil second voting to failure result
            });
    
            it('should return a proposals Ids array', async () => {}); 
        });
    });

    describe('#getActiveProposalsIds()', () => {

        it('should fail if unknown proposal type has been provided', async () => {});

        describe('If proposals has not been added at all', () => {

            it('should return empty array', async () => {});
        });

        describe('If registered proposals are exists', () => {

            beforeEach(async () => {
                // Add 2 proposals with two different types
            });

            it('should return empty array if all proposals in a passed state', async () => {            
                // Fulfil first voting to success result
                // Fulfil second  voting to failure result
            });
    
            it('should return a proposals Ids array', async () => {}); 
        });
    });

    describe('#replacePauser(address)', () => {

        it('should fail if sender not a pauser', async () => {});

        it('should replace existed pauser to the new one', async () => {}); 
    });

    describe('#replaceWhitelistAdmin(address)', () => {

        it('should fail if sender not a WhitelistAdmin', async () => {});

        it('should replace existed WhitelistAdmin to the new one', async () => {}); 
    });
});