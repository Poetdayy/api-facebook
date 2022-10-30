import express from "express";
import { signUp, login, logout } from "../controller/authController";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', (req, res) => {
        return res.send("Hello World with Eric")
    });

    router.post('/register', signUp);

    router.post('/login', login);

    //*Important: turn on when finish logout
    // router.post('/logout', logout);
    
    return app.use('/', router);
}

module.exports = initWebRoutes;