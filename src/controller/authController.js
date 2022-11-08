import AccountModel from "../models/accounts";
import VerifyModel from "../models/verify";

// Function for check condition - write for condition of auth

const isIdentifiedPhoneNumber = (phoneNumber, password) => {
  return phoneNumber !== password &&
    phoneNumber.charAt(0) === "0" &&
    phoneNumber.length === 10
    ? true
    : false;
};

const isIdentifiedPassword = (password) => {
  return password.length > 5 && password.length < 11 ? true : false;
};

const isUsedAccount = async (phoneNumber) => {
  let usedAccount = false;
  let isWrong = false;
  await AccountModel.findOne({
    phoneNumber: phoneNumber,
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
      }
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
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {Object}
 */
const isAccountMatch = async (phoneNumber, password, uuid) => {
  let result = {};
  let isWrong = false;
  let isFound = false;
  await AccountModel.findOne({
    phoneNumber: phoneNumber,
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
          let tokenList = generateToken(uuid);
          if (tokenList.isWrong) {
            isFound = false;
            isWrong = true;
          }
          let accessToken = tokenList.accessToken;
          let refreshToken = tokenList.refreshToken;
          let tokenArr = [];
          if (account.token[account.token.length - 1] != "") {
            tokenArr = account.token;
          }
          if (!tokenArr.includes(accessToken)) {
            tokenArr.push(accessToken);
          }
          account.token = tokenArr;
          await account.save();
          result = account;
          isWrong = false;
          isFound = true;
        } else {
          result = {
            code: 1004,
            message: "Invalid phone number or password",
          };
          isWrong = false;
          isFound = false;
        }
      } else {
        result = {
          code: 1004,
          message: "Invalid phone number or password",
        };
        isWrong = false;
        isFound = false;
      }
    })
    .catch((err) => {
      result = {
        code: 1005,
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
 * @returns {Object[]}
 */
function generateToken(uuid) {
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
    let accessToken = jwt.sign(uuid, process.env.jwtSecret);
    let b = new Buffer.alloc(11, hash, "base64");
    let refreshToken = b.toString("base64");
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
  let result = '';
  const charactersLength = string.length;
  let index = 0;
  while (index < length) {
    let checkDuplicateChar = string.charAt(Math.floor(Math.random() * charactersLength));
    if (!result.includes(checkDuplicateChar)) {
      result += checkDuplicateChar;
      index++;
    }
  }

  return result;
}

// list authAPI

let signUp = async (req, res) => {
  const { phoneNumber, password, uuid } = req.body;

  const isTrueUsedAccount = await isUsedAccount(phoneNumber);
  const isTruePhoneNumber = isIdentifiedPhoneNumber(phoneNumber, password);
  const isTruePassword = isIdentifiedPassword(password);

  if (isTrueUsedAccount.isWrong) {
    return res.json({
      code: 1005,
      message: "Unknown message",
      error: isTrueUsedAccount.error,
    })
  }

  if (!phoneNumber || !password || !uuid) {
    return res.json({
      code: 1002,
      message: "Parameter is not enough",
    });
  }

  if (isTruePhoneNumber && isTruePassword && !isTrueUsedAccount) {
    AccountModel.create({
      phoneNumber: phoneNumber,
      password: encodePassword(password),
      uuid: uuid,
      avatar: "",
      username: "",
      token: "",
    })
      .then((data) => {
        return res.json({
          code: 1000,
          message: "OK",
        });
      })
      .catch((err) => {
        return res.json({
          code: 1005,
          message: "Unknown error",
          error: err,
        })
      });
  } else if (!isTruePhoneNumber) {
    return res.json({
      code: 1004,
      message: "Phone number is invalid",
    });
  } else if (!isTruePassword) {
    return res.json({
      code: 1000,
      message: "Password is invalid",
    });
  } else if (isTrueUsedAccount) {
    return res.json({
      code: 9996,
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
  const { phoneNumber, password, uuid } = req.body;

  try {
    if (!phoneNumber || !password || !uuid) {
      return res.json({
        code: 1002,
        message: "Parameter is not enough",
      });
    }

    const passwordIsValid = isIdentifiedPassword(password);

    const phoneNumberIsValid = isIdentifiedPhoneNumber(phoneNumber);

    if (!passwordIsValid || !phoneNumberIsValid) {
      return res.json({
        code: 1004,
        message: "Parameter value is invalid.",
      });
    }

    const accountCheck = await isUsedAccount(phoneNumber);

    if (accountCheck.isWrong) {
      return res.json({
        code: 1005,
        message: "Unknown error",
        error: accountCheck.error,
      })
    }

    if (!accountCheck) {
      return res.json({
        code: 9995,
        message: "User is not validated.",
      });
    }

    const account = await isAccountMatch(phoneNumber, password, uuid);
    if (!account.isWrong) {
      if (account.isFound) {
        return res.json({
          code: 1000,
          message: "OK",
          data: {
            id: account.result.id ?? "",
            username: account.result.username ?? "",
            token: account.result.token ?? "",
            avatar: account.result.avatar ?? "",
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
      code: 1005,
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
      code: 1009,
      message: "Not access",
    });
  }
  await AccountModel.findOne({
    token: accessToken,
  }).then(async (data) => {
    if (data) {
      data.token = [];
      await data.save();
      const idToDelete = data._id.toString();
      await VerifyModel.findOne({ idToDelete }).then(async res => {
        await VerifyModel.deleteOne(res);
      }).catch(err => {
        res.json({
          code: 1005,
          message: 'Unknown error',
          error: err,
        })
      });
      return res.json({
        code: 1000,
        message: "OK",
      });
    } else {
      return res.json({
        code: 9998,
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
  let isGranted
  const accountCheck = await isUsedAccount(req.body.phoneNumber);
  if (accountCheck.isWrong) {
    return res.json({
      code: 1005,
      message: "Unknown error",
      error: accountCheck.error,
    })
  } else if (!accountCheck) {
    return res.json({
      code: 9995,
      message: 'User is not validated',
    })
  } else {
    let phoneNumber = req.body.phoneNumber;
    let account = await AccountModel.findOne({ phoneNumber });
    let accountId = account._id.toString();
    await VerifyModel.findOne({
      _id: accountId,
    })
      .then(async (data) => {
        if (!data) {
          await VerifyModel.create({
            _id: accountId,
            startTime: currentTime,
          });
          isGranted = true;
        } else {
          if (currentTime - data.startTime >= 2000) {
            data.startTime = currentTime;
            await data.save();
            isGranted = true;
          } else {
            isGranted = false;
          }
        }
        if (isGranted) {
          try {
            let numberString = '0123456789';
            let characterString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let randomNumberLength = 2;
            let randomCharacterLength = 4;
            let randomNumber = generateRandomSubString(randomNumberLength, numberString);
            let randomCharacter = generateRandomSubString(randomCharacterLength, characterString);
            let characterForCode = randomCharacter.concat(randomNumber).split('');
            let verifyCode = characterForCode.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value).join('');
            return res.json({
              code: 1000,
              message: "1000",
              data: {
                verifyCode: verifyCode,
              }
            })
          } catch (err) {
            return res.json({
              code: 1005,
              message: "Unknown error",
              error: err,
            })
          }
        } else {
          return res.json({
            code: 1009,
            message: "Not access",
          })
        }
      })
      .catch(err => {
        return res.json({
          code: 1005,
          message: "Unknown error",
          error: err,
        })
      })
  }
}

module.exports = {
  signUp,
  login,
  logout,
  get_verify_code,
};
