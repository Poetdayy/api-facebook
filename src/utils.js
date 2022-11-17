const jwt = require('jsonwebtoken');

/**
 * @author hieubt
 * @param {string} token 
 * @returns {Promise}
 */
export function verifyJwtToken(token, secretKey) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return reject(err);
            } else {
                resolve(decoded);
            }
        })
    })
}