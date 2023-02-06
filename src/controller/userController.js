// common function
import UserModel from '../models/users';
import { verifyJwtToken } from '../utils';
import AccountModel from '../models/accounts';

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
                  code: '9995',
                  message: 'User is not validated',
                });
              } else if (result?.is_blocked) {
                return res.json({
                  code: '9995',
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
          });
        });
    } catch (error) {
      return res.json({
        code: '1005',
        message: 'Unknown error',
      });
    }
  }
};

//TODO
const get_list_suggested_friend = async (req, res) => {};

/**
 * @description need test
 * @author hieubt
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
const set_request_friend = async (req, res) => {
  const { token, user_id } = req.body;
  if (!token || !user_id) {
    return res.json({
      code: '1002',
      message: 'Parameter is not enough',
    });
  } else {
    await verifyJwtToken(token, process.env.jwtSecret)
      .then(async () => {
        await AccountModel.findOne({ token: token })
          .then(async (response) => {
            if (response) {
              return res.json({
                code: '1004',
                message: 'Parameter value is invalid',
              });
            } else if (response.friendIds.length >= process.env.friendLimit) {
              return res.json({
                code: '9994',
                message: 'No data or end of list data',
              });
            } else {
              await UserModel.findOne({ id: user_id })
                .then(async (data) => {
                  if (!data) {
                    return res.json({
                      code: '9995',
                      message: 'User is not validated',
                    });
                  } else if (data?.is_blocked) {
                    return res.json({
                      code: '9995',
                      message: 'User is not validated',
                    });
                  } else {
                    if (!data?.friendRequestIds?.includes(user_id)) {
                      res.friendRequestIds.push(user_id);
                    }
                    await data.save();
                    return res.json({
                      code: '1000',
                      message: 'OK',
                      data: res.friendRequestIds.length,
                    });
                  }
                })
                .catch((err) => {
                  return res.json({
                    code: '1005',
                    message: 'Unknown error',
                  });
                });
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
          code: '1005',
          message: 'Unknown message',
        });
      });
  }
};

/**
 * @description need test
 * @author hieubt
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
const get_list_blocks = async (req, res) => {
  const { token, index, count } = req.body;
  if (!token || !index || !count) {
    return res.json({
      code: '1002',
      message: 'Parameter is not enough',
    });
  } else {
    await verifyJwtToken(token, process.env.jwtSecret)
      .then(async () => {
        await AccountModel.findOne({ token: token })
          .then(async (result) => {
            await getUserByAccountId(result._id.toString())
              .then((data) => {
                if (!data.found) {
                  return res.json({
                    code: '1005',
                    message: 'Unknown error',
                  });
                } else {
                  let blockedList = [];
                  for (let i = index; i <= count; i++) {
                    blockedList.push({
                      id: data?.foundUser?.id,
                      name: data?.foundUser?.username,
                      avatar: data?.foundUser?.avatar,
                    });
                  }
                  return res.json({
                    code: '1000',
                    message: 'OK',
                    data: JSON.stringify(blockedList),
                  });
                }
              })
              .catch((error) => {
                return res.json({
                  code: '1005',
                  message: 'Unknown error',
                });
              });
          })
          .catch((error) => {
            return res.json({
              code: '1005',
              message: 'Unknown error',
            });
          });
      })
      .catch((err) => {
        return res.json({
          code: '1005',
          message: 'Unknown error',
        });
      });
  }
};

module.exports = {
  getUserByAccountId,
  set_accept_friend,
  set_request_friend,
  get_list_blocks,
};
