import { use } from "moongose/routes";
import AccountModel from "../models/accounts";



// Function for check condition - write for condition of auth

// /**
//  * @author LeDuyAnhDung
//  * @typedef Props
//  * @property { String } req 
//  * @property { String } res
//  * @param { Props } props; 
//  */


const isIdentifiedPhoneNumber = (phoneNumber, password) => {
    (phoneNumber !== password) && (phoneNumber.charAt(0) === '0') && (phoneNumber.length === 10);
}

const isIdentifiedPassword = (password) => {
    password.length > 5 && password.length < 11;
}

const isUsedAccount = async (phoneNumber) => {

    await AccountModel.findOne({
        phoneNumber: phoneNumber,
    })
        .then((data) => {
            console.log(data);
            if (data) {
                return false;
            }
        })
        .catch(err => {
            console.log('usedPhoneNumber err', err);
        })

    return true;
}

// list authAPI

let signUp = async (req, res) => {
    const { phoneNumber, password, uuid } = req.body;

    const isUsedAccount = await isUsedAccount(phoneNumber);
    const isIdentifiedPhoneNumber = isIdentifiedPhoneNumber(phoneNumber, password);

    if (isIdentifiedPhoneNumber && !isUsedAccount) {

        AccountModel.create({
            phoneNumber: phoneNumber,
            password: password,
        }).then(data => {
            res.json('OK')
        })
            .catch(err => {
                console.log('usedPhoneNumber err', err);
            });
    }
    else if(!isIdentifiedPhoneNumber) {
        res.json('Incorrect formatting of phonenumber');
    }
    else if(isUsedAccount) {
        res.json('User existed');
    }

}

module.exports = {
    signUp
}