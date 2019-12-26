module.exports = {
    zeroAddress: '0x0000000000000000000000000000000000000000',

    unknownId: () => web3.utils.asciiToHex(Math.random().toString()),

    // Proposal types enumerator
    ProposalType: {
        ContractUpgrade: 0,
        MethodCall: 1
    },

    // Types of the Vote
    VoteType: {
        Yes: 0,
        No: 1,
        0: 'yes',
        1: 'no'
    }
};
