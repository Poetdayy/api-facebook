// common function
import UserModel from '../models/users';
import { verifyJwtToken } from '../utils';

/**
 * @author hieubt
 * @description find user by account's id
 *
 * @param {string} accountId
 * @return {Object}
 */
async function getUserByAccountId(accountId) {
  await UserModel.findOne({ id: accountId })
    .then((result) => {
      if (!result) {
        return {
          found: false,
        };
      } else {
        return {
          found: true,
          foundUser: result,
        };
      }
    })
    .catch((err) => {
      return {
        found: false,
        error: err,
      };
    });
}

const set_accept_friend = async (req, res) => {
  const { token, user_id, is_accept } = req.body;
  if (!token || !user_id || !is_accept) {
    return res.json({
      code: '1002',
      message: 'Parameter is not enough',
    });
  } else {
    try {
      await verifyJwtToken(token, process.env.jwtSecret)
        .then(async () => {
          await UserModel.findOne({ id: user_id })
            .then(async (result) => {
              if (!result) {
                return res.json({
                  code: 9995,
                  message: 'User is not validated',
                });
              } else {
                if (is_accept.toString() === '1') {
                  if (!result.friendIds.includes(is_accept.toString())) {
                    result.friendIds.push(is_accept.toString());
                  }
                  await result.save();
                  return res.json({
                    code: '1000',
                    message: 'OK',
                  });
                } else if (is_accept.toString() === '0') {
                  //TODO: delete suggested friend
                  return res.json({
                    code: '1000',
                    message: 'OK',
                  });
                }
              }
            })
            .catch((err) => {
              return res.json({
                code: '1005',
                message: 'Unknown error',
              });
            });
        })
        .catch((err) => {
          return res.json({
            code: '1009',
            message: 'Not access',
            error: err,
          });
        });
    } catch (err) {
      return res.json({
        code: '1005',
        message: 'Unknown error',
      });
    }
  }
};

module.exports = {
  getUserByAccountId,
  set_accept_friend,
};
