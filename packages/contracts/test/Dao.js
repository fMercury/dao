require('chai')
    .use(require('bn-chai')(web3.utils.BN))
    .should();

const {
    zeroAddress, 
    ProposalType
} = require('./helpers/constants');
const { assertRevert, assertEvent } = require('./helpers/assertions');
const { buildCallData } = require('./helpers/transactions');
const { toBN, toWeiBN } = require('./helpers/common');
const { isqrt } = require('./helpers/bnmath');
const {
    createTokenAndDistribute,
    createDaoContract,
    createTargetContract
} = require('./helpers/contracts');
const {
    addProposal,
    cancelProposal,
    doVote
} = require('./helpers/dao');
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
const ContractForDaoTestsV1 = Contracts.getFromLocal('ContractForDaoTestsV1');

contract('DAO', accounts => {
    const tokenOwner = accounts[1];
    const initialProxyOwner = accounts[2];
    const initialTargetOwner = accounts[3];
    const proposalCreator1 = accounts[4];
    const proposalCreator2 = accounts[5];
    const voter1 = accounts[6];
    const voter2 = accounts[7];
    const voter3 = accounts[8];
    const voter4 = accounts[9];
    const voter5 = accounts[10];

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
    let daoPaused;
    let target;

    beforeEach(async () => {
        // Create service token instance
        token = await createTokenAndDistribute(
            Erc20Token,
            '1000000000',
            tokenOwner,
            tokensDistribution
        );
        
        // Create upgradeability project
        project = await TestHelper({
            from: initialProxyOwner
        });

        // DAO instance
        dao = await createDaoContract(
            project,
            Dao,
            token.address,
            initialProxyOwner,
            [proposalCreator1]
        );

        // DAO instance
        daoPaused = await createDaoContract(
            project,
            Dao,
            token.address,
            initialProxyOwner,
            [proposalCreator1],
            true,
            true
        );

        // Target contract for testing governance features of DAO
        target = await createTargetContract(
            project,
            ContractForDaoTestsV1,
            dao,
            initialTargetOwner
        );        
    });

    describe('#addProposal(string,uint8,uint256,address,uint256,bytes)', () => {

        it('should fail if sender address not whitelisted', async () => {
            await assertRevert(dao.methods['addProposal(string,uint8,uint256,address,uint256,bytes)'](
                'Change target contract owner',
                ProposalType.MethodCall,
                '10',
                target.address,
                '0',
                buildCallData('transferOwnership(address)', ['address'], [voter1])
            ).send({
                from: voter1// Not whitelisted
            }), 'WhitelistedRole: caller does not have the Whitelisted role');
        });

        it('should fail if contract in a paused state', async () => {
            await assertRevert(daoPaused.methods['addProposal(string,uint8,uint256,address,uint256,bytes)'](
                'Change target contract owner',
                ProposalType.MethodCall,
                '10',
                target.address,
                '0',
                buildCallData('transferOwnership(address)', ['address'], [voter1])
            ).send({
                from: proposalCreator1
            }), 'Pausable: paused');
        });

        it('should fail if proposal type has unknown value', async () => {
            await assertRevert(dao.methods['addProposal(string,uint8,uint256,address,uint256,bytes)'](
                'Change target contract owner',
                5,// Wrong type
                '10',
                target.address,
                '0',
                buildCallData('transferOwnership(address)', ['address'], [voter1])
            ).send({
                from: proposalCreator1
            }));
        });

        it('should fail if destination target address equal to zero', async () => {
            await assertRevert(dao.methods['addProposal(string,uint8,uint256,address,uint256,bytes)'](
                'Change target contract owner',
                1,
                '10',
                zeroAddress,
                '0',
                buildCallData('transferOwnership(address)', ['address'], [voter1])
            ).send({
                from: proposalCreator1
            }), 'INVALID_DESTINATION');
        });

        it('sent ether value should be consistent with value parameter', async () => {
            await assertRevert(dao.methods['addProposal(string,uint8,uint256,address,uint256,bytes)'](
                'Change target contract owner',
                1,
                '10',
                target.address,
                web3.utils.toWei('1', 'ether'),
                buildCallData('transferOwnership(address)', ['address'], [voter1])
            ).send({
                from: proposalCreator1,
                value: web3.utils.toWei('0.9', 'ether')
            }), 'INSUFFICIENT_ETHER_VALUE');
        });

        it('should add new proposal (without sent ether value)', async () => {
            await addProposal(
                dao,
                target.address,
                proposalCreator1,
                {
                    details: 'Change target contract owner',
                    proposalType: ProposalType.MethodCall,
                    duration: '10',
                    value: '0',
                    methodName: 'transferOwnership(address)',
                    methodParamTypes: ['address'],
                    methodParams: [voter1]
                }
            );
        });

        it('should add new proposal (with sent ether value)', async () => {
            await addProposal(
                dao,
                target.address,
                proposalCreator1,
                {
                    details: 'Change target contract owner',
                    proposalType: ProposalType.MethodCall,
                    duration: '10',
                    value: '1',
                    methodName: 'transferOwnership(address)',
                    methodParamTypes: ['address'],
                    methodParams: [voter1]
                }
            );
        });
    });

    describe('#cancelProposal(uint256)', () => {
        let proposalId;

        beforeEach(async () => {
            // Add proposal
            proposalId = await addProposal(
                dao,
                target.address,
                proposalCreator1,
                {
                    details: 'Change target contract owner',
                    proposalType: ProposalType.MethodCall,
                    duration: '10',
                    value: '0',
                    methodName: 'transferOwnership(address)',
                    methodParamTypes: ['address'],
                    methodParams: [voter1]
                }
            );
        });

        it('should fail if sender address not a proposer address', async () => {
            await assertRevert(dao.methods['cancelProposal'](proposalId).send({
                from: voter1// Not a proposer
            }), 'NOT_A_PROPOSER');
        });

        it.skip('should fail if proposal in a passed state', async () => {});

        it.skip('should fail if proposal in a processed state', async () => {});

        it('should fail if proposal cancelled', async () => {
            await cancelProposal(
                dao,
                proposalId,
                proposalCreator1
            );
            await assertRevert(dao.methods['cancelProposal'](proposalId).send({
                from: proposalCreator1
            }), 'ALREADY_CANCELLED');
        });
        
        it('should cancel proposal', async () => {
            await cancelProposal(
                dao,
                proposalId,
                proposalCreator1
            );
        });
    });

    describe('#vote(uint256,uint256)', () => {
        let proposalId;

        beforeEach(async () => {
            // Add proposal
            proposalId = await addProposal(
                dao,
                target.address,
                proposalCreator1,
                {
                    details: 'Change target contract owner',
                    proposalType: ProposalType.MethodCall,
                    duration: '10',
                    value: '0',
                    methodName: 'transferOwnership(address)',
                    methodParamTypes: ['address'],
                    methodParams: [voter1]
                }
            );
        });

        it.skip('should fail if contract is paused', async () => {
            // @todo Implement this after whole DAO workflow will be implemented
        });

        it.skip('should fail if reentrant call detected', async () => {});

        it.skip('should fail if proposal in a passed state', async () => {});

        it('should fail if proposal cancelled', async () => {
            await cancelProposal(
                dao,
                proposalId,
                proposalCreator1
            );
            await assertRevert(dao.methods['vote(uint256,uint256)'](
                proposalId,
                toWeiBN('5').toString()
            ).send({
                from: voter1
            }), 'ALREADY_CANCELLED');
        });

        it('should fail if sender tokens balance insufficient', async () => {
            await assertRevert(dao.methods['vote(uint256,uint256)'](
                proposalId,
                toWeiBN('15').toString()
            ).send({
                from: voter1
            }), 'INSUFFICIENT_TOKENS_BALANCE');
        });

        it('should fail if tokens allowance for the DAO address insufficient', async () => {
            await assertRevert(dao.methods['vote(uint256,uint256)'](
                proposalId,
                toWeiBN('5').toString()
            ).send({
                from: voter1
            }), 'INSUFFICIENT_TOKENS_ALLOWANCE');
        });

        it.skip('should fail if already enough votes in voting', async () => {});

        it.skip('should fail if voting is expired', async () => {});

        it('should accept a vote', async () => {
            await doVote(
                dao,
                proposalId,
                '5',
                voter1
            );
        });
    });

    describe.skip('#revokeVote(uint256)', () => {

        beforeEach(async () => {
            // Add proposal
            // Add a vote for proposal
        });

        it('should fail if proposal in a passed state', async () => {});

        it('should fail if proposal cancelled', async () => {});

        it('should revoke a vote', async () => {});
    });

    describe.skip('#processProposal(uint256)', () => {

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

    describe.skip('#tokensBalance()', () => {

        it('should return 0 if votes are not been placed', async () => {});

        it('should return released tokens balance', async () => {
            // Add proposal
            // Vote for proposal
            // Revoke a vote
        });
    });

    describe.skip('#withdrawTokens()', () => {

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

    describe.skip('#getProposal(uint256)', () => {

        it('should fail if proposal not found', async () => {});
    
        it('should return a proposal', async () => {});
    });

    describe.skip('#getActiveProposalsIds()', () => {

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

    describe.skip('#getActiveProposalsIds(uint8)', () => {

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

    describe.skip('#replacePauser(address)', () => {

        it('should fail if sender not a pauser', async () => {});

        it('should replace existed pauser to the new one', async () => {}); 
    });

    describe.skip('#replaceWhitelistAdmin(address)', () => {

        it('should fail if sender not a WhitelistAdmin', async () => {});

        it('should replace existed WhitelistAdmin to the new one', async () => {}); 
    });

    describe('#votingResult(uint256)', () => {
        let proposalId;

        beforeEach(async () => {
            // Add proposal
            proposalId = await addProposal(
                dao,
                target.address,
                proposalCreator1,
                {
                    details: 'Change target contract owner',
                    proposalType: ProposalType.MethodCall,
                    duration: '10',
                    value: '0',
                    methodName: 'transferOwnership(address)',
                    methodParamTypes: ['address'],
                    methodParams: [voter1]
                }
            );
        });

        it('should return 0 if no votes has beed added', async () => {
            const votingResult = await dao.methods['votingResult(uint256)'](proposalId).call();
            (votingResult).should.equal('0');
        });

        it.skip('should return 0 if votes has been added and then revoked', async () => {});

        it('should return a voting result', async () => {
            const votesToVote = '5';
            await doVote(
                dao,
                proposalId,
                votesToVote,
                voter1
            );
            const votingResult = await dao.methods['votingResult(uint256)'](proposalId).call();
            (votingResult).should.equal(isqrt(toWeiBN(votesToVote)).toString());
        });
    });
});