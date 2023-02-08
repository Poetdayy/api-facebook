// common function
import UserModel from '../models/users';
import { verifyJwtToken } from '../helper/utils';
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
    await verifyJwtToken(token, process.env.jwtSecret)
    .then(async () => {
      await AccountModel.findOne({ token: token })
        .then(async (response) => {
          if (response) {
            return res.json({
              code: '1004',
              message: 'Parameter value is invalid',
            });
          } else {
            return res.status(200).json({
              message: "ok",
            })
          }
        }); 
    })
  }
}

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
}
