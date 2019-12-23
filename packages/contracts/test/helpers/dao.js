const { assertEvent } = require('./assertions');
const { buildCallData } = require('./transactions');
const { toBN, toWeiBN } = require('./bnmath');

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