import express from "express";
import { 
    addPost, 
    editPost, 
    getPost, 
    deletePost, 
    reportPost, 
    handleUploadFile,
    setComment, 
} from "../controller/postController";

// handle router
 
let router = express.Router();

let initPostsRoutes = (app) => {    
    router.post('/', handleUploadFile, addPost);

    router.post('/:id', reportPost);

    router.post('/:id/comment', setComment);

    router.get('/:id', getPost);

    router.put('/:id', editPost);
    
    router.delete('/:id', deletePost);
    
    // router.get('/:id', getPosts);
    
    // router.get('/:id/likePost', getLike);

    return app.use('/api/posts', router);
}

module.exports = initPostsRoutes;