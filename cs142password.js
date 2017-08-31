const crypto = require('crypto');
/*
 * Return a salted and hashed password entry from a
 * clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry
 * where passwordEntry is an object with two string
 * properties:
 *      salt - The salt used for the password.
 *      hash - The sha1 hash of the password and salt
 */
function makePasswordEntry(clearTextPassword) {
    const hashObj = crypto.createHash('sha1');
    const salt = crypto.randomBytes(8).toString('hex');
    hashObj.update(clearTextPassword+salt);
    return {
        salt: salt,
        hash: hashObj.digest('hex')
    };
}


/*
 * Return true if the specified clear text password
 * and salt generates the specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
    const hashObj = crypto.createHash('sha1');
    hashObj.update(clearTextPassword+salt);
    return hashObj.digest('hex') === hash;
}

module.exports = {
    makePasswordEntry,
    doesPasswordMatch
}
