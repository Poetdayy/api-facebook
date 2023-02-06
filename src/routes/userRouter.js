import express from 'express';
import {
  set_accept_friend,
  set_accept_friend,
  set_request_friend,
  get_list_blocks,
} from '../controller/userController';

let router = express.Router();

let initUserRoutes = (app) => {
  router.post('/set_accept_friend', set_accept_friend);

  router.post('/set_request_friend', set_request_friend);

  router.post('/get_list_blocks', get_list_blocks);

  return app.use('/user', router);
};

module.exports = initUserRoutes;
