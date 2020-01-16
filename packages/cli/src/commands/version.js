const { title, log } = require('../utils/stdout');
const packageJson = require('../../package.json');

module.exports = async () => {
    title('Dao Command Line Interface');
    log('Version', packageJson.version);

    return packageJson.version;
};