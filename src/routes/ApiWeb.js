import express from "express";
import { signUp } from "../controller/authController";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', (req, res) => {
        return res.send("Hello World with Eric")
    });

    router.post('/register', signUp);
    
    return app.use('/', router);
}

module.exports = initWebRoutes;