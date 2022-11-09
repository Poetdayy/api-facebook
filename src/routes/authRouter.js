import express from "express";
import {
  signUp,
  login,
  logout,
  get_verify_code,
} from "../controller/authController";

let router = express.Router();

let initAuthRoutes = (app) => {
  router.post("/register", signUp);

  router.post("/login", login);

  router.post("/logout", logout);

  router.post("/get_verify_code", get_verify_code);

  return app.use("/", router);
};

module.exports = initAuthRoutes;
