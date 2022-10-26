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
    return (phoneNumber !== password) && (phoneNumber.charAt(0) === '0') && (phoneNumber.length === 10) ? true : false;
}

const isIdentifiedPassword = (password) => {
    return password.length > 5 && password.length < 11 ? true : false;
}

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
        .catch(err => {
            console.log('usedPhoneNumber err', err);
        })

    return usedAccount;
}

// list authAPI

let signUp = async (req, res) => {
    const { phoneNumber, password, uuid } = req.body;

    const isTrueUsedAccount = await isUsedAccount(phoneNumber);
    const isTruePhoneNumber = isIdentifiedPhoneNumber(phoneNumber, password);
    const isTruePassword = isIdentifiedPassword(password);

    if (isisTruePhoneNumber && isTruePassword && !isTrueUsedAccount) {

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
    else if(!isTruePassword) {
        res.json('Incorrect formatting of phonenumber');
    }
    else if(!isTrueUsedAccount) {
        res.json('Incorrect formattion of password');
    }
    else if(isTrueUsedAccount) {
        res.json('User existed');
    }

}

module.exports = {
    signUp
}