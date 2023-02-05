import express from 'express';
import { set_accept_friend } from '../controller/userController';

let router = express.Router();

let initUserRoutes = (app) => {
  router.post('/set_accept_friend', set_accept_friend);

  return app.use('/user', router);
};

module.exports = initUserRoutes;
