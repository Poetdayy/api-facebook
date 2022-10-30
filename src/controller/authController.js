import { use } from "moongose/routes";
import AccountModel from "../models/accounts";

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
  await AccountModel.findOne({
    phoneNumber: phoneNumber,
  })
    .then((data) => {
      if (data) {
        usedAccount = true;
      }
    })
    .catch((err) => {
      console.log("usedPhoneNumber err", err);
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
  let foundAccount = {};
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
          let accessToken = generateToken(uuid).accessToken;
          let refreshToken = generateToken(uuid).refreshToken;
          account.token = accessToken;
          await account.save();
          foundAccount = account;
        }
      }
    })
    .catch((err) => {
      console.log("Phone number err", err);
    });
  return foundAccount;
};

/**
 * @author hieubt
 * @description generate user access token
 * @param {string} uuid
 * @returns {Object[]}
 */
function generateToken(uuid) {
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
    return { errors: err };
  }
}

// list authAPI

let signUp = async (req, res) => {
  const { phoneNumber, password, uuid } = req.body;

  const isTrueUsedAccount = await isUsedAccount(phoneNumber);
  const isTruePhoneNumber = isIdentifiedPhoneNumber(phoneNumber, password);
  const isTruePassword = isIdentifiedPassword(password);

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
        console.log("usedPhoneNumber err", err);
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

    if (!accountCheck) {
      return res.json({
        code: 9995,
        message: "User is not validated.",
      });
    }

    const account = await isAccountMatch(phoneNumber, password, uuid);
    console.log(account);
    if (account) {
      // let accessToken = generateToken(uuid).accessToken;
      // let refreshToken = generateToken(uuid).refreshToken;
      // account.token = accessToken;
      return res.json({
        code: 1000,
        message: "OK",
        data: {
          id: account.id ?? "",
          username: account.username ?? "",
          token: account.token ?? "",
          avatar: account.avatar ?? "",
        },
      });
    } else {
      return res.json({
        code: 1004,
        message: "Invalid phone number or password",
      });
    }
  } catch (err) {
    return res.json({
      code: 1005,
      message: "Unknown error",
      error: err.message,
    });
  }
};

//TODO: write function for handling logout api
// const logout = async (req, res) => {
//   const accessToken = req.body.token;
//   await AccountModel.findOne({
//     token: "",
//   }).then((data) => {
//     if (data) {
//       data.token = "";
//       // res.redirect('/');
//       return res.json({
//         code: 1000,
//         message: "OK",
//       });
//     } else {
//       return res.json("Can't find");
//     }
//   });
// };

module.exports = {
  signUp,
  login,
  logout,
};
