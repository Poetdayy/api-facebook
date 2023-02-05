import express from "express";
import { signUp, login, logout, get_verify_code, check_verify_code, refresh_token, change_info_after_signup } from "../controller/authController";

let router = express.Router();

let initAuthRoutes = (app) => {

    router.post('/signup', signUp);

    router.post('/login', login);

    router.post('/logout', logout);

    router.post('/get_verify_code', get_verify_code);

    router.post('/check_verify_code', check_verify_code);

    router.post('/refresh_token', refresh_token);

    router.post('/change_info_after_signup', change_info_after_signup);

    return app.use('/', router);
}

module.exports = initAuthRoutes;