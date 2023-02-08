import express from "express";

import {
  addPost,
  editPost,
  getPost,
  deletePost,
  reportPost,
  setComment,
} from "../controller/postController";

import { uploadImage, uploadVideo } from "../helper/utils";

// handle router
let router = express.Router();

let initPostsRoutes = (app) => {
  router.post("/add_post", uploadImage, addPost);

  router.delete("/delete_post", deletePost);

  router.post("/report_post", reportPost);

  // router.get('/get_post', getPost);

  // router.get('/:id', getPosts);

  // router.put('/:id', editPost);

  // router.post('/:id/comment', setComment);

  // router.get('/:id/likePost', getLike);

  return app.use("/post", router);
};

module.exports = initPostsRoutes;
