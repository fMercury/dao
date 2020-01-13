module.exports.log = (label, text, divided = false) => {

    if (process.env.TESTING) {
        return;// Suppress logs in testing mode
    }

    if (divided) {
        console.log('\x1b[36m' + '='.repeat(80), '\x1b[0m');
    }

    console.log(
        label ? `\x1b[36m${label}: \x1b[0m` : '',
        text
    );    
};