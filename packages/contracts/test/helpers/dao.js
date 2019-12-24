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
 * @returns {string} Proposal Id (stringified integer value)
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


const doVote = async (
    daoInstance,
    proposalId,
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
    const result = await daoInstance.methods['vote(uint256,uint256)'](
        proposalId,
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
    const tokensBalanceAfter = await serviceTokenInstance.methods['balanceOf'](voterAddress).call();
    
    // Validate locked tokens
    (toBN(tokensBalanceBefore).sub(toBN(tokensBalanceAfter))).should.eq.BN(voteValue);

    // Validate voting result
    const votingResultAfter = await daoInstance.methods['votingResult(uint256)'](proposalId).call();
    (toBN(votingResultAfter).sub(toBN(votingResultBefore))).should.eq.BN(votesAccepted);
};
module.exports.doVote = doVote;