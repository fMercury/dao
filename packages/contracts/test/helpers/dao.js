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

    // Trying to fetch a vote from a proposal
    // If success - then VoteRevoked event will be checked after the adding of a new vote
    try {
        const vote = await daoInstance.methods['getVote(uint256)'](proposalId).call({
            from: voterAddress
        });
        oldVoteType = vote.voteType;
        oldValueOriginal = vote.valueOriginal;
        isUpdate = oldValueOriginal !== '0' && !vote.revoked;
    } catch(err) {}// eslint-disable-line no-empty
    
    // Add a vote
    const result = await daoInstance.methods['vote(uint256,uint8,uint256)'](
        proposalId,
        voteType,
        voteValue.toString()
    ).send({
        from: voterAddress
    });

    // If vote is updated - emitted votes value will be equal to cumulutive value
    const trueVoteValue = !isUpdate ? voteValue.toString() : (voteValue.add(toBN(oldValueOriginal)));
    const votesAccepted = isqrt(trueVoteValue);

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
            p => (p).should.equal(trueVoteValue.toString())
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
            ]
        ]);
    }

    const tokensBalanceAfter = await serviceTokenInstance.methods['balanceOf'](voterAddress).call();
    
    // Validate locked tokens
    (toBN(tokensBalanceBefore).sub(toBN(tokensBalanceAfter))).should.eq.BN(voteValue);

    // Validate voting result
    const votingResultAfter = await daoInstance.methods['votingResult(uint256)'](proposalId).call();

    if (isUpdate) {

        // If a vote has been updated then we should take into account 'votesAccepted' changing
        // Also we should take into account that VoteType can be changed during the update
        if (voteType.toString() === oldVoteType) {

            (toBN(votingResultAfter[VoteType[voteType]])).should.eq.BN(
                toBN(votingResultBefore[VoteType[voteType]])
                    .sub(isqrt(oldValueOriginal))
                    .add(votesAccepted)
            );            
        } else {

            (toBN(votingResultAfter[oldVoteType])).should.eq.BN(
                toBN(votingResultBefore[oldVoteType]).sub(isqrt(oldValueOriginal))
            );

            (toBN(votingResultAfter[VoteType[voteType]])).should.eq.BN(
                toBN(votingResultBefore[VoteType[voteType]]).add(votesAccepted)
            );
        }
    } else {

        // If a vote just added then voting result simply increases by a new value
        (toBN(votingResultAfter[VoteType[voteType]])).should.eq.BN(
            toBN(votingResultBefore[VoteType[voteType]]).add(votesAccepted)
        );
    }
};
module.exports.doVote = doVote;

/**
 * Revoke a vote
 * @param {Object} daoInstance DAO instance object
 * @param {string} proposalId Proposal Id
 * @param {string} voterAddress Voter address
 * @returns {Promise}
 */
const revokeVote = async (daoInstance, proposalId, voterAddress) => {
    const serviceTokenAddress = await daoInstance.methods['serviceToken()']().call();
    const serviceTokenInstance = await Erc20Token.at(serviceTokenAddress);
    const tokensBalanceBefore = await serviceTokenInstance.methods['balanceOf'](voterAddress).call();
    const votingResultBefore = await daoInstance.methods['votingResult(uint256)'](proposalId).call();

    // Get original vote
    const vote = await daoInstance.methods['getVote(uint256)'](proposalId).call({
        from: voterAddress
    });

    // Revoke this vote
    const result = await daoInstance.methods['revokeVote(uint256)'](proposalId).send({
        from: voterAddress
    });

    assertEvent(result, 'VoteRevoked', [
        [
            'proposalId',
            p => (p).should.equal(proposalId)
        ],
        [
            'voteType',
            p => (p).should.equal(vote.voteType)
        ],
        [
            'voter',
            p => (p).should.equal(voterAddress)
        ],
        [
            'votes',
            p => (p).should.equal(vote.valueOriginal)
        ]
    ]);

    // Validate released tokens
    const tokensBalanceAfter = await serviceTokenInstance.methods['balanceOf'](voterAddress).call();
    (toBN(tokensBalanceAfter).sub(toBN(tokensBalanceBefore)).toString()).should.equal(vote.valueOriginal);

    // Validate voting result
    const votingResultAfter = await daoInstance.methods['votingResult(uint256)'](proposalId).call();
    (
        toBN(votingResultAfter[VoteType[Number(vote.voteType)]])
            .add(toBN(votingResultBefore[VoteType[Number(vote.voteType)]]))
    ).should.eq.BN(vote.valueAccepted);
};
module.exports.revokeVote = revokeVote;