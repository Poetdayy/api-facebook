// common function
import UserModel from '../models/users'

/**
 * @author hieubt
 * @description find user by account's id
 * 
 * @param {string} accountId 
 * @return {Object}
 */
async function getUserByAccountId(accountId) {
    await UserModel.findOne({ id: accountId })
        .then(result => {
            if (!result) {
                return {
                    found: false,
                }
            } else {
                return {
                    found: true,
                    foundUser: result,
                }
            }
        })
        .catch(err => {
            return {
                found: false,
                error: err,
            }
        })
}

module.exports = {
    getUserByAccountId,
}