import express from "express";
import {
  signUp,
  login,
  logout,
  get_verify_code,
  check_verify_code,
  refresh_token,
} from "../controller/authController";

let router = express.Router();

let initAuthRoutes = (app) => {
  router.post("/register", signUp);

  router.post("/logout", logout);

  router.post("/get_verify_code", get_verify_code);

  router.post("/get_verify_code", get_verify_code);

  router.post("/check_verify_code", check_verify_code);

  router.post("/refresh_token", refresh_token);

  return app.use("/", router);
};

module.exports = initAuthRoutes;
