import express from "express";
import multer from "multer";
import path from "path";
import {
  getLike,
  addPost,
  editPost,
  getPost,
  deletePost,
} from "../controller/postController";

const storage = multer.diskStorage({
  destination: "./public/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `$(file.fieldname)_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 600000,
  },
});

let router = express.Router();

let initPostsRoutes = (app) => {
  router.post("/", addPost);

  router.get("/:id", getPost);

  router.put("/:id", editPost);

  router.delete("/:id", deletePost);

  // router.get('/:id', getPosts);

  router.get("/:id/likePost", getLike);

  return app.use("/api/posts", router);
};

module.exports = initPostsRoutes;
