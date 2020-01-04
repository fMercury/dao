const { VoteType, ProposalType } = require('./constants');
const { assertEvent } = require('./assertions');
const { buildCallData } = require('./transactions');
const { toBN, toWeiBN, dateTimeFromDuration } = require('./common');
const { isqrt } = require('./bnmath');
const { Contracts, ZWeb3 } = require('@openzeppelin/upgrades');
ZWeb3.initialize(web3.currentProvider);
const Erc20Token = Contracts.getFromLocal('Erc20Token');

/**
 * Add new proposal and assert result
 * @param {Object} daoInstance DAO instance object
 * @param {string} proposalCreator Proposal creator address
 * @param {Object} proposalOptions Proposal options object
 * @returns {Promise<{string}>} Proposal Id (stringified integer value)
 */
const addProposal = async (
    daoInstance, 
    proposalCreator,
    proposalOptions
) => {
    const bnValue = toWeiBN(proposalOptions.value);    
    const result = await daoInstance.methods['addProposal(string,uint8,uint256,address,uint256,bytes)'](
        proposalOptions.details,
        proposalOptions.proposalType,
        proposalOptions.duration,
        proposalOptions.destination,
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
    const trueVoteValue = !isUpdate ? voteValue : voteValue.add(toBN(oldValueOriginal));
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
 * Voting campaign
 * @param {Object} daoInstance DAO instance object
 * @param {string} proposalId Proposal Id
 * @param {number} voteType Type of the vote
 * @param {Object[{voter:{string},vote:{string}}]} campaign Array of votes
 * @returns {Promise}
 */
const votingCampaign = async (daoInstance, proposalId, voteType, campaign = []) => {

    for (let v of campaign) {
        await doVote(
            daoInstance,
            proposalId,
            voteType,
            v.votes,
            v.voter
        );
    }
};
module.exports.votingCampaign = votingCampaign;

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

    assertEvent(result, 'TokensReleased', [
        [
            'voter',
            p => (p).should.equal(voterAddress)
        ],
        [
            'value',
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

/**
 * Process proposal
 * @param {Object} daoInstance DAO instance object
 * @param {string} proposalId Proposal Id
 * @param {string} proposalCreator Creator of the proposal address
 * @param {number} voteType Type of votes in campaign
 * @param {Object[{voter:{string},vote:{string}}]} campaign Array of votes
 * @param {bool} brokenTx Is proposal contains broken transaction 
 * @returns {Promise}
 */
const processProposal = async (
    daoInstance, 
    proposalId, 
    proposalCreator, 
    voteType, 
    campaign = [], 
    brokenTx = false,
    preCampaign = []
) => {
    // Join campaigns
    if (preCampaign.length > 0 ) {
        campaign = campaign.map(v => {
            const voters = preCampaign.filter(p => p.voter === v.voter);
            v = voters.length === 0 ? v : voters.reduce((a, c) => {
                a.votes = (Number(a.votes) + Number(c.votes)).toString();
                return a;
            }, v);
            return v;
        });
    }

    // Calculate local results
    const target = VoteType[Number(voteType)];

    const calculatedCampaign = campaign.reduce((a, c) => {        
        a[target] = a[target].add(isqrt(toWeiBN(c.votes)));
        return a;
    }, {
        yes: toBN(0),
        no: toBN(0)
    });

    // Process proposal
    const result = await daoInstance.methods['processProposal(uint256)'](proposalId).send({
        from: proposalCreator
    });

    // Validate voting result
    const votingResult = await daoInstance.methods['votingResult(uint256)'](proposalId).call();
    (votingResult.yes).should.eq.BN(calculatedCampaign.yes);
    (votingResult.no).should.eq.BN(calculatedCampaign.no);

    const isPassed = calculatedCampaign.yes.gt(calculatedCampaign.no);

    // Validate ProposalProcessed event
    assertEvent(result, 'ProposalProcessed', [
        [
            'proposalId',
            p => (p).should.equal(proposalId)
        ],
        [
            'passed',
            p => (p).should.equal(isPassed)
        ]
    ]);

    // Validate state changing
    const proposal = await daoInstance.methods['getProposal(uint256)'](proposalId).call();
    (proposal.flags[1]).should.be.true;

    if (isPassed) {

        (proposal.flags[0]).should.be.true;

        if (!brokenTx) {
            
            assertEvent(result, 'TransactionSuccessed', [
                [
                    'proposalId',
                    p => (p).should.equal(proposalId)
                ]
            ]);
        } else {

            assertEvent(result, 'TransactionFailed', [
                [
                    'proposalId',
                    p => (p).should.equal(proposalId)
                ]
            ]);
        }
    }
};
module.exports.processProposal = processProposal;

/**
 * Move Dao to the paused state
 * @param {Object} daoInstance DAO instance object
 * @param {string} proposalCreator Creator of the proposal address
 * @param {Object[{voter:{string},vote:{string}}]} campaign Array of votes
 * @returns {Promise}
 */
const pauseDao = async (daoInstance, proposalCreator, campaign) => {
    const currentTimeBefore = await daoInstance.methods['currentTime()']().call(); 
    // Add proposal
    const proposalId = await addProposal(
        daoInstance,
        proposalCreator,
        {
            details: 'Replace Dao pauser account',
            proposalType: ProposalType.MethodCall,
            duration: '1',
            value: '0',
            destination: daoInstance.address,
            methodName: 'pause',
            methodParamTypes: [],
            methodParams: []
        }
    );

    // Fulfill voting (to success result)
    await votingCampaign(daoInstance, proposalId, VoteType.Yes, campaign);

    // Rewind Dao time to the end of a voting
    const endDate = dateTimeFromDuration(2, Number(currentTimeBefore.toString()));
    await daoInstance.methods['setCurrentTime(uint256)'](endDate.toString()).send();

    // Process
    await processProposal(
        daoInstance,
        proposalId,
        proposalCreator,
        VoteType.Yes, 
        campaign
    );
    
    // Check result
    (await daoInstance.methods['paused()']().call()).should.be.true;
};
module.exports.pauseDao = pauseDao;

/**
 * Withdraw locked tokens from the Dao
 * @param {Object} daoInstance DAO instance object
 * @param {Object} tokenInstance Governance tokens instance object
 * @param {string} proposalId If of the proposal
 * @param {string} voterAddress Address of the voter
 * @param {string|number} controlBalance Balance to check with withdrawn value
 * @returns {Promise}
 */
const withdrawTokens = async (
    daoInstance, 
    tokenInstance,
    proposalId, 
    voterAddress,
    controlBalance
) => {
    // Validate tokens balance
    controlBalance = toWeiBN(controlBalance).toString();
    const balance = await daoInstance.methods['tokensBalance(uint256)'](proposalId).call({
        from: voterAddress
    });
    (balance.toString()).should.equal(controlBalance, 'Tokens balance not equal control balance');

    const voterBalanceBefore = await tokenInstance.methods['balanceOf(address)'](voterAddress).call({
        from: voterAddress
    });
    
    // Do withdraw
    const result = await daoInstance.methods['withdrawTokens(uint256)'](proposalId).send({
        from: voterAddress
    });

    // Validate emitted event
    assertEvent(result, 'TokensReleased', [
        [
            'voter',
            p => (p).should.equal(voterAddress)
        ],
        [
            'value',
            p => (p).should.equal(controlBalance)
        ]
    ]);

    // Validate voter balance
    const voterBalanceAfter = await tokenInstance.methods['balanceOf(address)'](voterAddress).call({
        from: voterAddress
    });
    (
        toBN(voterBalanceAfter)
            .sub(toBN(voterBalanceBefore))
    ).should.eq.BN(toBN(controlBalance));
};
module.exports.withdrawTokens = withdrawTokens;