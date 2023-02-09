import express from "express";

import { 
    addPost, 
    editPost, 
    getPost, 
    deletePost, 
    reportPost, 
    setComment,
    getComment,
    like, 
} from "../controller/postController";

import { uploadImage, uploadVideo, setAllowUploadType } from "../helper/utils";

// handle router
let router = express.Router();

let initPostsRoutes = (app) => {    
    router.post('/add_post', uploadImage, addPost);
    
    router.delete('/delete_post', deletePost);
    
    router.post('/report_post', reportPost);

    router.post('/like', like);

    router.post('/get_post', getPost);
    
    // router.get('/get_post', getPost);
    
    // router.get('/:id', getPosts);

    // router.put('/:id', editPost);

    router.post('/set_comment', setComment);

    router.post('/get_comment', getComment)
    
    // router.get('/:id/likePost', getLike);

    return app.use('/', router);
}

module.exports = initPostsRoutes;