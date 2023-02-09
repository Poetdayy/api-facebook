// common function
import UserModel from '../models/users';
import { verifyJwtToken } from '../helper/utils';
import AccountModel from '../models/accounts';
import _ from 'lodash';

/**
 * @typedef User
 * @property {string} id
 * @property {string} username
 * @property {string} phoneNumber
 * @property {Date} created
 * @property {string} avatar
 * @property {boolean} is_blocked
 * @property {boolean} online
 * @property {string[]} friendIds
 * @property {string[]} friendRequestIds
 * @property {string[]} blocked_list
 * @property {string[]} suggested_friendIds
 */

/**
 * @typedef SameFriendResponse
 * @property {'failed' | 'success'} result
 * @property {number} same
 * @property {string} error
 */

/**
 * This function returns a promise that resolves to an object with a found property that is either true
 * or false, and if true, a foundUser property that is the user object.
 * @author hieubt
 * @param {string} accountId - The account id of the user you want to find.
 * @returns {Promise<{found: boolean, foundUser?: User, error?: Object}>}
 */
async function getUserByAccountId(accountId) {
  return await UserModel.findOne({ id: accountId })
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

/**
 * It takes two user_ids as input and returns the number of friends they have in common
 * @author hieubt
 * @param {string} currentUserId - The account_id of the current user
 * @param {string} destinationUserId - The user_id of the user you want to find the same friends with.
 * @returns {Promise<SameFriendResponse>} An object with three properties: result, same and error.
 */
async function findSameFriends(currentUserId, destinationUserId) {
  let currentUser = await getUserByAccountId(currentUserId);
  let destinationUser = await getUserByAccountId(destinationUserId);
  if (currentUser.found && destinationUser.found) {
    if (
      _.isEmpty(currentUser.foundUser.friendIds) ||
      _.isEmpty(destinationUser.foundUser.friendIds)
    ) {
      return {
        result: 'success',
        same: 0,
      };
    } else {
      let sameFriends = currentUser.foundUser.friendIds.filter((elem) =>
        destinationUser.foundUser.friendIds.includes(elem)
      );
      return {
        result: 'success',
        same: sameFriends.length,
      };
    }
  } else {
    return {
      result: 'failed',
      error: 'Wrong user_id',
    };
  }
}

/**
 * @author hieubt
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
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
          await AccountModel.findOne({ token: token }).then(async (rs) => {
            await UserModel.findOne({ id: rs._id.toString() })
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
                  if (_.isEmpty(result.friendRequestIds)) {
                    return res.json({
                      code: '1004',
                      message: 'Parameter value is invalid',
                    });
                  } else {
                    let isExistedRequest = false;
                    let requestList = result.friendRequestIds;
                    requestList.forEach(async (request) => {
                      if (request.id.toString() === user_id) {
                        isExistedRequest = true;
                        requestList.slice(requestList.indexOf(request), 1);
                        console.log(requestList)
                        result.suggested_friendIds = suggestedList;
                        await result.save();
                      }
                    });
                    if (is_accept.toString() === '1') {
                      let friendList = result.friendIds;
                      let isExistedFriend = false;
                      friendList.forEach((friend) => {
                        if (friend.id.toString() === user_id) {
                          isExistedFriend = true;
                          return res.json({
                            code: '1004',
                            message: 'Parameter value is invalid',
                          });
                        }
                      });
                      if (!isExistedFriend) {
                        const d = new Date();
                        d.setMinutes(d.getMinutes() + 60);
                        let date = new Date(
                          d.getTime() - d.getTimezoneOffset() * 60000
                        );
                        friendList.push({
                          id: user_id,
                          created: date.toISOString(),
                        });
                        result.friendIds = friendList;
                        result.friendRequestIds = requestList;
                        await result.save();
                        return res.json({
                          code: '1000',
                          message: 'OK',
                        });
                      }
                    } else if (is_accept.toString() === '0') {
                      requestList.forEach((request) => {
                        if (request.id.toString() === user_id) {
                          requestList.slice(requestList.indexOf(request), 1);
                        }
                      });
                      let suggestedList = result.suggested_friendIds;
                      suggestedList.forEach((suggested) => {
                        if (suggested.id.toString() === user_id) {
                          suggestedList.slice(
                            suggestedList.indexOf(suggested),
                            1
                          );
                        }
                      });
                      result.friendRequestIds = requestList;
                      result.suggested_friendIds = suggestedList;
                      await result.save();
                      return res.json({
                        code: '1000',
                        message: 'OK',
                      });
                    }
                    if (!isExistedRequest) {
                      return res.json({
                        code: '1004',
                        message: 'Parameter value is invalid',
                      });
                    }
                  }
                }
              })
              .catch((err) => {
                return res.json({
                  code: '1005',
                  message: 'Unknown error',
                });
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

/**
 * @description need test
 * @author hiebt
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
const get_list_suggested_friend = async (req, res) => {
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
          .then(async (response) => {
            if (response) {
              let data = [];
              let suggested_id = [];
              let user = await getUserByAccountId(response._id);
              if (user.found) {
                let allUsers = await UserModel.find({});
                allUsers.forEach(async (elem) => {
                  let same = await findSameFriends(user.foundUser.id, elem.id);
                  if (same.result === 'success' && same.same >= 2) {
                    data.push({
                      user_id: elem.id,
                      username: elem.username,
                      avatar: elem.avatar,
                      same_friends: same,
                    });
                    if (!suggested_id.includes(elem.id)) {
                      const d = new Date();
                      d.setMinutes(d.getMinutes() + 60);
                      let date = new Date(
                        d.getTime() - d.getTimezoneOffset() * 60000
                      );
                      suggested_id.push({
                        user_id: elem.id,
                        created: date.toISOString(),
                      });
                    }
                  }
                });
              } else {
                return res.json({
                  code: '9998',
                  message: 'Token is invalid',
                });
              }
              user.foundUser.suggested_friendIds = suggested_id;
              await user.foundUser.save();
              return res.json({
                code: '1000',
                message: 'OK',
                data: JSON.stringify(data),
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
          message: 'Unknown error',
        });
      });
  }
};

/**
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
            if (!response) {
              return res.json({
                code: '1004',
                message: 'Parameter value is invalid',
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
                  } else if (
                    data.friendIds?.length >= process.env.friendLimit
                  ) {
                    return res.json({
                      code: '9994',
                      message: 'No data or end of list data',
                    });
                  } else {
                    const d = new Date();
                    d.setMinutes(d.getMinutes() + 60);
                    let date = new Date(
                      d.getTime() - d.getTimezoneOffset() * 60000
                    );
                    let checkRequested = 0;
                    data?.friendRequestIds.forEach((request) => {
                      if (request.id === user_id) {
                        checkRequested += 1;
                      }
                    });
                    if (checkRequested === 0) {
                      data.friendRequestIds.push({
                        id: user_id.toString(),
                        created: date.toISOString(),
                      });
                    }
                    await data.save();
                    return res.json({
                      code: '1000',
                      message: 'OK',
                      data: data.friendRequestIds?.length,
                    });
                  }
                })
                .catch((err) => {
                  return res.json({
                    code: '1005',
                    message: 'Unknown error',
                    err: err.message,
                  });
                });
            }
          })
          .catch((err) => {
            return res.json({
              code: '1005',
              message: 'Unknown error',
              err: err.message,
            });
          });
      })
      .catch((err) => {
        return res.json({
          code: '1005',
          message: 'Unknown message',
          err: err.message,
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

/**
 * @description set block 1 or unblock 0 for user
 * @author dunglda
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
const set_block = async (req, res) => {
  const { token, user_id, type } = req.body;
  if (!token || !user_id || !type) {
    return res.json({
      code: '1002',
      message: 'Parameter is not enough',
    });
  } else {
    await verifyJwtToken(token, process.env.jwtSecret).then(async () => {
      await AccountModel.findOne({ token: token }).then(async (response) => {
        if (response) {
          return res.json({
            code: '1004',
            message: 'Parameter value is invalid',
          });
        } else {
          return res.status(200).json({
            message: 'ok',
          });
        }
      });
    });
  }
};

const get_requested_friend = async (req, res) => {
  const { token, index, count } = req.body;
};

// try {

//   const trueAccessToken = existAccessToken(token);
//   const trueType = 0 || 1;

//   //Testcase 2: Wrong access token
//   if (trueAccessToken) {

//     const user = await UserModel.findOne(token);
//     if (user) {
//       if (user.is_blocked === 1) {
//         return res.status(403).json({
//           code: "1001",
//           message: "Wrong access token, go back login screen!",
//         })
//       }
//     }

//     if (user._id === user_id) {
//       return res.status(403).json({
//         message: "It's user_id of your own"
//       })
//     }

//     const blockUser = await UserModel.findById(user_id)
//     if (blockUser) {
//       //Testcase 7: User has is_blocked!
//       if (blockUser.is_blocked === 1) {
//         return res.json(403).json({
//           message: "User has is_blocked!"
//         })
//       }

//       //Testcase 8: Wrong TrueType!
//       if (trueType) {
//         if (trueType === 1 && blockUser.is_blocked === 1) {
//             return res.json(500).status({
//               message: "user has been blocked!"
//             })
//         } else if (trueType === 0 && blockUser.is_blocked === 0) {
//             return res.json(500).status({
//               message: "user has not block"
//             })
//         } else {
//             await UserModel.updateOne({user_id}, {
//                 is_blocked: trueType,
//               })

//             return res.json(403).json({
//               code: "1000",
//               message: "set block successfully!"
//             })
//         }

//       } else {
//         return res.json(403).json({
//           message: "Type must be 0 or 1"
//         })
//       }

//     } else {
//       return res.json(403).json({
//         message: "Not found blockUser!"
//       })
//     }

// } else {
//   res.status(403).json({
//     code: "1001",
//     message: "Wrong access token, go back login screen!",
//   })
// }

// } catch (err) {
//   res.status(500).json({
//     code: "9999",
//     message: "Server failed to post!" + err,
//   });
// }

module.exports = {
  getUserByAccountId,
  set_accept_friend,
  set_request_friend,
  get_list_blocks,
  set_block,
  get_list_suggested_friend,
};
