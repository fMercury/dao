module.exports = async (promise, reason = false) => {
    
    try {
        await promise;
        assert.fail('Expected revert not received');
    } catch (error) {
        const revertFound = error.message.search('revert') >= 0;
        const reasonFoundByString = error.message.search(reason) >= 0;
        const reasonFound = reason ? error.reason == reason || reasonFoundByString : true;// truffle 5 have to provide a revert reason string
        assert(
            revertFound && reasonFound, 
            `Expected "revert"${reason ? ' with reason "'+reason+'"' : ''}, got ${error} instead`
        );        
    }
};
