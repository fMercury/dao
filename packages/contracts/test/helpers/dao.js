const { VoteType } = require('./constants');
const { assertEvent } = require('./assertions');
const { buildCallData } = require('./transactions');
const { toBN, toWeiBN } = require('./common');
const { isqrt } = require('./bnmath');
const { Contracts, ZWeb3 } = require('@openzeppelin/upgrades');
Contracts.setLocalBuildDir('./artifacts');
ZWeb3.initialize(web3.currentProvider);
const Erc20Token = Contracts.getFromLocal('Erc20Token');

/**
 * Add new proposal and assert result
 * @param {Object} daoInstance DAO instance object
 * @param {string} targetAddress Target contract address
 * @param {string} proposalCreator Proposal creator address
 * @param {Object} proposalOptions Proposal options object
 * @returns {Promise<{string}>} Proposal Id (stringified integer value)
 */
const addProposal = async (
    daoInstance, 
    targetAddress, 
    proposalCreator,
    proposalOptions
) => {
    const bnValue = toWeiBN(proposalOptions.value);
    const result = await daoInstance.methods['addProposal(string,uint8,uint256,address,uint256,bytes)'](
        proposalOptions.details,
        proposalOptions.proposalType,
        proposalOptions.duration,
        targetAddress,
        bnValue.toString(),
        buildCallData(
            proposalOptions.methodName, 
            proposalOptions.methodParamTypes, 
            proposalOptions.methodParams)
    ).send({
        from: proposalCreator,
        value: bnValue.gt(toBN(0)) ? bnValue.toString(): undefined
    });

    const totalProposals = await daoInstance.methods['proposalCount()']().call();
    const proposalId = (totalProposals - 1).toString();
    assertEvent(result, 'ProposalAdded', [
        [
            'proposer',
            p => (p).should.equal(proposalCreator)
        ],
        [
            'proposalId',
            p => (p).should.equal(proposalId)
        ]
    ]);

    return proposalId;
};
module.exports.addProposal = addProposal;

/**
 * Cancel proposal
 * @param {Object} daoInstance DAO instance object
 * @param {string} proposalId Proposal Id
 * @param {string} proposalCreator Proposal creator address
 * @returns {Promise}
 */
const cancelProposal = async (
    daoInstance, 
    proposalId, 
    proposalCreator
) => {
    const result = await daoInstance.methods['cancelProposal(uint256)'](proposalId).send({
        from: proposalCreator
    });
    assertEvent(result, 'ProposalCancelled', [
        [
            'proposalId',
            p => (p).should.equal(proposalId)
        ]
    ]);
};
module.exports.cancelProposal = cancelProposal;

/**
 * Create new Vote or update existed one
 * @param {Object} daoInstance DAO instance object
 * @param {string} proposalId Proposal Id
 * @param {number} voteType Type of the Vote VoteType.Yes|VoteType.No
 * @param {string} voteValue Amount of service tokens to send as a vote
 * @param {string} voterAddress Voter address
 * @returns {Promise}
 */
const doVote = async (
    daoInstance,
    proposalId,
    voteType,
    voteValue,
    voterAddress
) => {
    const serviceTokenAddress = await daoInstance.methods['serviceToken()']().call();
    const serviceTokenInstance = await Erc20Token.at(serviceTokenAddress);
    voteValue = toWeiBN(voteValue);
    await serviceTokenInstance.methods['approve(address,uint256)'](
        daoInstance.address,
        voteValue.toString()
    ).send({
        from: voterAddress
    });

    const tokensBalanceBefore = await serviceTokenInstance.methods['balanceOf'](voterAddress).call();
    const votingResultBefore = await daoInstance.methods['votingResult(uint256)'](proposalId).call();

    let isUpdate = false;
    let oldVoteType;
    let oldValueOriginal;
    let oldValueAccepted;

    // Trying to fetch a vote from a proposal
    // If success - then VoteRevoked event will be checked after the adding of a new vote
    try {
        const vote = await daoInstance.methods['getVote(uint256)'](proposalId).call();
        oldVoteType = vote.voteType;
        oldValueOriginal = vote.valueOriginal;
        oldValueAccepted = vote.valueAccepted;
        isUpdate = oldValueOriginal !== '0' && !vote.revoked;
    } catch(err) {}// eslint-disable-line no-empty
    
    const result = await daoInstance.methods['vote(uint256,uint8,uint256)'](
        proposalId,
        voteType,
        voteValue.toString()
    ).send({
        from: voterAddress
    });
    const votesAccepted = isqrt(voteValue);
    assertEvent(result, 'VoteAdded', [
        [
            'proposalId',
            p => (p).should.equal(proposalId)
        ],
        [
            'voteType',
            p => (p).should.equal(voteType.toString())
        ],
        [
            'voter',
            p => (p).should.equal(voterAddress)
        ],
        [
            'votes',
            p => (p).should.equal(voteValue.toString())
        ],
        [
            'votesAccepted',
            p => (p).should.equal(votesAccepted.toString())
        ]
    ]);

    if (isUpdate) {

        assertEvent(result, 'VoteRevoked', [
            [
                'proposalId',
                p => (p).should.equal(proposalId)
            ],
            [
                'voteType',
                p => (p).should.equal(oldVoteType)
            ],
            [
                'voter',
                p => (p).should.equal(voterAddress)
            ],
            [
                'votes',
                p => (p).should.equal(oldValueOriginal)
            ],
            [
                'votesAccepted',
                p => (p).should.equal(oldValueAccepted)
            ]
        ]);
    }

    const tokensBalanceAfter = await serviceTokenInstance.methods['balanceOf'](voterAddress).call();
    
    // Validate locked tokens
    (toBN(tokensBalanceBefore).sub(toBN(tokensBalanceAfter))).should.eq.BN(voteValue);

    // Validate voting result
    const votingResultAfter = await daoInstance.methods['votingResult(uint256)'](proposalId).call();
    (
        toBN(votingResultAfter[VoteType[voteType]])
            .sub(toBN(votingResultBefore[VoteType[voteType]]))
    ).should.eq.BN(votesAccepted);
};
module.exports.doVote = doVote;