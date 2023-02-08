import AccountModel from "../models/accounts";
import VerifyModel from "../models/verify";
import UserModel from "../models/users";
import { verifyJwtToken } from "../helper/utils";

// Function for check condition - write for condition of auth

const isIdentifiedPhoneNumber = (phonenumber, password) => {
  return phonenumber !== password &&
    phonenumber.charAt(0) === "0" &&
    phonenumber.length === 10
    ? true
    : false;
};

const isIdentifiedPassword = (password) => {
  return password.length > 5 && password.length < 11 ? true : false;
};

const isUsedAccount = async (phonenumber) => {
  let usedAccount = false;
  let isWrong = false;
  await AccountModel.findOne({
    phonenumber: phonenumber,
  })
    .then((data) => {
      if (data) {
        usedAccount = true;
      } else {
        usedAccount = false;
      }
    })
    .catch((err) => {
      return {
        isWrong: isWrong,
        error: err,
      };
    });

  return usedAccount;
};

/**
 * @author hieubt
 * @description encode user password
 * @param {string} password
 * @returns {string}
 */
function encodePassword(password) {
  var crypto = require("crypto");
  let salt = crypto.randomBytes(16).toString("base64");
  let hash = crypto
    .createHmac("sha512", salt)
    .update(password)
    .digest("base64");
  let encodedPassword = salt + "$" + hash;
  return encodedPassword;
}

/**
 * @author hieubt
 * @param {string} phonenumber
 * @param {string} password
 * @returns {Object}
 */
const isAccountMatch = async (phonenumber, password, uuid) => {
  let result = {};
  let isWrong = false;
  let isFound = false;
  await AccountModel.findOne({
    phonenumber: phonenumber,
  })
    .then(async (account) => {
      if (account) {
        var crypto = require("crypto");
        let passwordField = account.password.split("$");
        let salt = passwordField[0];
        let hash = crypto
          .createHmac("sha512", salt)
          .update(password)
          .digest("base64");
        if (hash === passwordField[1]) {
          let tokenList = generateToken(
            phonenumber,
            password,
            uuid,
            account._id
          );
          if (tokenList.isWrong) {
            isFound = false;
            isWrong = true;
          }
          let accessToken = tokenList.accessToken;
          let refreshToken = tokenList.refreshToken;
          const d = new Date();
          d.setMinutes(d.getMinutes() + 60);
          let date = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
          account.token = accessToken;
          account.refreshToken = refreshToken;
          account.expirationAccessTokenDate = date.toISOString();
          await account.save();
          result = account;
          isWrong = false;
          isFound = true;
        } else {
          result = {
            code: "1004",
            message: "Invalid phone number or password",
          };
          isWrong = false;
          isFound = false;
        }
      } else {
        result = {
          code: "1004",
          message: "Invalid phone number or password",
        };
        isWrong = false;
        isFound = false;
      }
    })
    .catch((err) => {
      result = {
        code: "1005",
        message: "Unknown error",
        error: err,
      };
      isWrong = true;
    });
  return {
    result: result,
    isFound: isFound,
    isWrong: isWrong,
  };
};

/**
 * @author hieubt
 * @description generate user access token
 * @param {string} uuid
 * @param {string} userId
 * @param {string} phonenumber
 * @param {string} password
 * @returns {Object[]}
 */
function generateToken(phonenumber, password, uuid, userId) {
  let isWrong = false;
  let token = {};
  var jwt = require("jsonwebtoken");
  var crypto = require("crypto");
  try {
    let refreshId = uuid + process.env.jwtSecret;
    let salt = crypto.randomBytes(16).toString("base64");
    let hash = crypto
      .createHmac("sha512", salt)
      .update(refreshId)
      .digest("base64");
    let accessToken = jwt.sign(
      { id: userId, phonenumber, password, uuid },
      process.env.jwtSecret,
      { expiresIn: process.env.tokenLife }
    );
    let b = new Buffer.alloc(11, hash, "base64");
    // let refreshToken = b.toString("base64");
    let refreshToken = jwt.sign(
      { id: userId, phonenumber, password, uuid },
      process.env.refreshTokenSecret,
      { expiresIn: process.env.refreshTokenLife }
    );
    token = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
    return token;
  } catch (err) {
    return {
      errors: err,
      isWrong: isWrong,
    };
  }
}

/**
 * @author hieubt
 * @description generate a sub string that have length characters from original string
 *
 * @param {number} length
 * @param {string} string
 * @returns {string}
 */
function generateRandomSubString(length, string) {
  let result = "";
  const charactersLength = string.length;
  let index = 0;
  while (index < length) {
    let checkDuplicateChar = string.charAt(
      Math.floor(Math.random() * charactersLength)
    );
    if (!result.includes(checkDuplicateChar)) {
      result += checkDuplicateChar;
      index++;
    }
  }

  return result;
}

/**
 * @author hieubt
 * @description check if access token is valid
 * @param {string} token
 * @return {Object}
 */
async function checkAccessToken(token) {
  await AccountModel.findOne({ token })
    .then((result) => {
      if (!result) {
        return {
          found: false,
        };
      } else {
        const expiredTime = 3600000;
        const d = new Date();
        let now = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        const expirationAccessTokenDate = new Date(
          result.expirationAccessTokenDate
        );
        if (now - expirationAccessTokenDate > expiredTime) {
          return {
            found: true,
            expired: true,
          };
        } else {
          return {
            found: true,
            expired: false,
          };
        }
      }
    })
    .catch((err) => {
      return {
        found: false,
        error: err,
      };
    });
}

// list authAPI

let signUp = async (req, res) => {
  const { phonenumber, password, uuid } = req.body;

  const isTrueUsedAccount = await isUsedAccount(phonenumber);
  const isTruePhoneNumber = isIdentifiedPhoneNumber(phonenumber, password);
  const isTruePassword = isIdentifiedPassword(password);

  if (isTrueUsedAccount.isWrong) {
    return res.json({
      code: "1005",
      message: "Unknown message",
      error: isTrueUsedAccount.error,
    });
  }

  if (!phonenumber || !password || !uuid) {
    return res.json({
      code: "1002",
      message: "Parameter is not enough",
    });
  }

  if (isTruePhoneNumber && isTruePassword && !isTrueUsedAccount) {
    AccountModel.create({
      phoneNumber: phonenumber,
      password: encodePassword(password),
      uuid: uuid,
      token: "",
      expirationAccessTokenDate: "",
      refreshToken: "",
    })
      .then(async (data) => {
        const d = new Date();
        let date = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        UserModel.create({
          id: data._id,
          username: "",
          phoneNumber: phonenumber,
          created: date.toISOString(),
          avatar: "",
          is_blocked: false,
          online: true,
        })
          .then(async (user) => {
            await user.save();
          })
          .catch((err) => {
            return res.json({
              code: "1005",
              message: "Unknown error",
              error: err,
            });
          });
        return res.json({
          code: "1000",
          message: "OK",
        });
      })
      .catch((err) => {
        return res.json({
          code: "1005",
          message: "Unknown error",
          error: err,
        });
      });
  } else if (!isTruePhoneNumber) {
    return res.json({
      code: "1004",
      message: "Phone number is invalid",
    });
  } else if (!isTruePassword) {
    return res.json({
      code: "1000",
      message: "Password is invalid",
    });
  } else if (isTrueUsedAccount) {
    return res.json({
      code: "9996",
      message: "User existed",
    });
  }
};

/**
 * @author hieubt
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
const login = async (req, res) => {
  const { phonenumber, password, uuid } = req.body;

  try {
    if (!phonenumber || !password || !uuid) {
      return res.json({
        code: "1002",
        message: "Parameter is not enough",
      });
    }

    const passwordIsValid = isIdentifiedPassword(password);

    const phoneNumberIsValid = isIdentifiedPhoneNumber(phonenumber);

    if (!passwordIsValid || !phoneNumberIsValid) {
      return res.json({
        code: "1004",
        message: "Parameter value is invalid.",
      });
    }

    const accountCheck = await isUsedAccount(phonenumber);

    if (accountCheck.isWrong) {
      return res.json({
        code: "1005",
        message: "Unknown error",
        error: accountCheck.error,
      });
    }

    if (!accountCheck) {
      return res.json({
        code: "9995",
        message: "User is not validated.",
      });
    }

    const account = await isAccountMatch(phonenumber, password, uuid);
    if (!account.isWrong) {
      if (account.isFound) {
        return res.json({
          code: "1000",
          message: "OK",
          data: {
            id: account.result._id ?? "",
            token: account.result.token ?? "",
          },
        });
      } else {
        return res.json(account.result);
      }
    } else {
      return res.json(result);
    }
  } catch (err) {
    return res.json({
      code: "1005",
      message: "Unknown error",
      error: err.message,
    });
  }
};

/**
 * @author hieubt
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
const logout = async (req, res) => {
  const accessToken = req.body.token;
  if (!accessToken) {
    return res.json({
      code: "1009",
      message: "Not access",
    });
  }
  await AccountModel.findOne({
    token: accessToken,
  }).then(async (data) => {
    if (data) {
      data.token = "";
      data.expirationAccessTokenDate = "";
      data.refreshToken = "";
      await data.save();
      const idToDelete = data._id.toString();
      await VerifyModel.findOne({ idToDelete })
        .then(async (res) => {
          await VerifyModel.deleteOne(res);
        })
        .catch((err) => {
          res.json({
            code: "1005",
            message: "Unknown error",
            error: err,
          });
        });
      return res.json({
        code: "1000",
        message: "OK",
      });
    } else {
      return res.json({
        code: "9998",
        message: "Token is invalid",
      });
    }
  });
};

/**
 * @author hieubt
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
const get_verify_code = async (req, res) => {
  var currentTime = new Date().getTime();
  let isGranted;
  let verifyCode;
  const accountCheck = await isUsedAccount(req.body.phoneNumber);
  if (accountCheck.isWrong) {
    return res.json({
      code: "1005",
      message: "Unknown error",
      error: accountCheck.error,
    });
  } else if (!accountCheck) {
    return res.json({
      code: "9995",
      message: "User is not validated",
    });
  } else {
    let phoneNumber = req.body.phoneNumber;
    let account = await AccountModel.findOne({ phoneNumber });
    let accountId = account._id.toString();
    await VerifyModel.findOne({
      _id: accountId,
    })
      .then(async (data) => {
        try {
          let numberString = "0123456789";
          let characterString =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
          let randomNumberLength = 2;
          let randomCharacterLength = 4;
          let randomNumber = generateRandomSubString(
            randomNumberLength,
            numberString
          );
          let randomCharacter = generateRandomSubString(
            randomCharacterLength,
            characterString
          );
          let characterForCode = randomCharacter.concat(randomNumber).split("");
          verifyCode = characterForCode
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .join("");
        } catch (err) {
          return res.json({
            code: "1005",
            message: "Unknown error",
            error: err,
          });
        }
        if (!data) {
          await VerifyModel.create({
            _id: accountId,
            startTime: currentTime,
            verifyCode: verifyCode,
          });
          isGranted = true;
        } else {
          if (currentTime - data.startTime >= 2000) {
            data.startTime = currentTime;
            data.verifyCode = verifyCode;
            await data.save();
            isGranted = true;
          } else {
            isGranted = false;
          }
        }
        if (isGranted) {
          return res.json({
            code: "1000",
            message: "OK",
            data: {
              verifyCode: verifyCode,
            },
          });
        } else {
          return res.json({
            code: "1009",
            message: "Not access",
          });
        }
      })
      .catch((err) => {
        return res.json({
          code: "1005",
          message: "Unknown error",
          error: err,
        });
      });
  }
};

/**
 * @author hieubt
 * @description check if verify code is valid
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
const check_verify_code = async (req, res) => {
  const { phoneNumber, verifyCode } = req.body;

  if (!phoneNumber || !verifyCode) {
    return res.json({
      code: "1002",
      message: "Parameter is not enough",
    });
  }

  if (!isIdentifiedPhoneNumber(phoneNumber)) {
    return res.json({
      code: "1004",
      message: "Parameter value is invalid",
    });
  }

  try {
    await AccountModel.findOne({ phoneNumber })
      .then(async (account) => {
        if (!account) {
          return res.json({
            code: "9995",
            message: "User is not valid",
          });
        } else {
          await VerifyModel.findOne({ verifyCode }).then(async (code) => {
            if (!code) {
              return res.json({
                code: "1004",
                message: "Parameter value is invalid",
              });
            } else {
              if (!code.verified) {
                code.verified = true;
                await code.save();
                return res.json({
                  code: "1000",
                  message: "OK",
                  data: {
                    token: account.token,
                    id: account._id,
                  },
                });
              } else {
                return res.json({
                  code: "9996",
                  message: "User existed",
                });
              }
            }
          });
        }
      })
      .catch((err) => {
        return res.json({
          code: "1005",
          message: "Unknown error",
          error: err,
        });
      });
  } catch (err) {
    return res.json({
      code: "1005",
      message: "Unknown error",
      error: err,
    });
  }
};

/**
 * @author hieubt
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
async function refresh_token(req, res) {
  const { refreshToken, uuid } = req.body;
  if (!refreshToken) {
    return res.json({
      code: "1002",
      message: "Parameter is not enough",
    });
  }
  try {
    const jwt = require("jsonwebtoken");
    await verifyJwtToken(refreshToken, process.env.refreshTokenSecret)
      .then(async () => {
        const user = await AccountModel.findOne({
          refreshToken: refreshToken,
        })
          .then((data) => {
            return data;
          })
          .catch((err) => {
            console.log(err);
          });

        const objectToSign = {
          id: user._id.toString(),
          phoneNumber: user.phoneNumber,
          password: user.password,
          uuid: uuid,
        };
        const token = jwt.sign(objectToSign, process.env.jwtSecret, {
          expiresIn: process.env.tokenLife,
        });

        return res.json({
          token: token,
        });
      })
      .catch((err) => {
        return res.json({
          code: "1009",
          message: "Not access",
          error: err,
        });
      });
  } catch (err) {
    return res.json({
      code: "1005",
      message: "Unknown error",
      error: err,
    });
  }
}

/**
 * @author hieubt
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON}
 */
const change_info_after_signup = async (req, res) => {
  const { token, username, avatar } = req.body;
  if (!token && (!username || !avatar)) {
    return res.json({
      code: "1002",
      message: "Parameter is not enough",
    });
  } else {
    try {
      await verifyJwtToken(token, process.env.jwtSecret)
        .then(async () => {
          await AccountModel.findOne({ token: token }).then(async (result) => {
            if (!result) {
              return res.json({
                code: "1004",
                message: "Token is invalid",
              });
            } else {
              await UserModel.findOne({ id: result._id }).then(async (data) => {
                if (!data) {
                  return res.json({
                    code: "9995",
                    message: "User id not validated",
                  });
                } else {
                  let specialChar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
                  let minLength = 2;
                  let maxLength = 10;
                  // const blockCondition = !specialChar.test(username) && (username < minLength || username > maxLength) && (username === data.phoneNumber);
                  let blockCondition;
                  if (
                    !specialChar.test(username) &&
                    username.length >= minLength &&
                    username.length <= maxLength &&
                    username != data.phoneNumber
                  ) {
                    data.username = username;
                    data.avatar = avatar;
                    await data.save();
                    return res.json({
                      code: "1000",
                      message: "OK",
                      data: {
                        id: data.id,
                        username: data.username,
                        phoneNumber: data.phoneNumber,
                        created: data.created,
                        avatar: data.avatar,
                      },
                    });
                  } else {
                    if (!blockCondition) {
                      return res.json({
                        code: "1004",
                        message: "Parameter value is invalid",
                        is_blocked: "false",
                      });
                    } else {
                      data.is_blocked = true;
                      await data.save();
                      return res.json({
                        code: "1004",
                        message: "Parameter value is invalid",
                        is_blocked: "true",
                      });
                    }
                  }
                }
              });
            }
          });
        })
        .catch((err) => {
          return res.json({
            code: "1009",
            message: "Not access",
            error: err,
          });
        });
    } catch (err) {
      return res.json({
        code: "1005",
        message: "Unknown error",
        error: err,
      });
    }
  }
};

module.exports = {
  signUp,
  login,
  logout,
  get_verify_code,
  check_verify_code,
  checkAccessToken,
  refresh_token,
  change_info_after_signup,
};
