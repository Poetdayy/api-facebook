import Post from "../models/posts";
import AccountModel from "../models/accounts";

const verifyAccessToken = async (token) => {
  const haveAccessToken = false;

  await AccountModel.findOne({ token }).then((data) => {
    console.log(data);
    if (data) {
      haveAccessToken = true;
    }
  });

  return haveAccessToken;
};

// List API used for Post Status
const addPost = async (req, res) => {
  const { token, described } = req.body;
  const newPost = new Post(req.body);

  try {
    const isVerifiedAccessToken = await verifyAccessToken(token);

    if (described !== "") {
      const savedPost = await newPost.save();
      const createdPost = {
        id: savedPost._id,
        url: savedPost.url,
      };

      return res.status(200).json({
        code: 1000,
        message: "Post created successfully!",
        data: createdPost,
      });
    } else {
      res.json({
        message: "go back the login screen!",
      });
    }
  } catch (err) {
    res.status(500).json({
      code: "9999",
      message: err,
    });
  }
};

const editPost = async (req, res) => {
  const { userId, accept_block } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (post.userId === userId && accept_block === 0) {
      await post.updateOne({ $set: req.body });

      res.status(200).json({
        code: 1000,
        message: "your post has been update",
      });
    } else if (accept_block === 1) {
      res.json({
        code: 1010,
        message: "Your content is inappropriate!",
      });
    } else {
      res.status(403).json("You can update only your post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    console.log("f", post.banned);
    if (post.banned === 1 || post.banned === 2) {
      res.json({
        code: 9992,
        message: "the post is banned!",
      });
    }

    if (post.userId === req.body.userId) {
      await post.deleteOne();

      res.status(200).json({
        code: 1000,
        message: "the post has been deleted",
      });
    } else {
      res.status(403).json({
        code: 9992,
        message: "post is not existed",
      });
    }
  } catch (err) {
    res.status(500).json({
      code: 1001,
      message: "your internet is disconnected!",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post);

    const bannedPost = post.banned === 1 || post.banned === 2;

    res.status(200).json({
      message: "Post got successfully!",
      code: 1000,
      data: post,
    });

    // if (post === null) {
    //   res.json({
    //     message:"not show status",
    //   })
    // } else if (bannedPost) {
    //   res.json({
    //     code: "9992"
    //   })
    // } else if (is_blocked === 1) {
    //   res.json({
    //     message: "you have been blocked"
    //   })
    // } else if (post.can_comment === 1) {
    //   res.json({
    //     message: "not show comment"
    //   })
    // } else {
    //   res.status(200).json({
    //     message: 'Post got successfully!',
    //     code: 1000,
    //     data: post
    //   });
    // }
  } catch (err) {
    res.status(500).json(err);
  }
};

// const getListPost = async (req, res) => {
//     let postArray = [];
//     try {
//         const currentUser = await User.findById(req.body.userID);
//         const userPosts = await Post.find({userID: currentUser._id});
//         const friendPosts = await Promise.all(
//             currentUser.followings.map()
//         )
//     } catch (err) {
//         res.status(500).json(err)
//     }
// }

// const getLikePost = async (req, res) => {
//     try {
//         const post = await Post.findByIdS(req.params.id);
//         if(!post.likes.includes(req.body))
//     }
// }

const getLike = async (req, res) => {
  const { token, id } = req.body;
  const newLike = new Like(req.body);
  const post = await Post.findById(req.params.id);
  console.log(post);

  try {
    const isVerifiedAccessToken = await verifyAccessToken(token);
    const bannedPost = post.banned === 1 || post.banned === 2;

    if (id !== "") {
      const savedLike = await newLike.save();
      const createdLike = {
        id: savedLike._id,
        url: savedLike.url,
      };

      return res.status(200).json({
        code: 1000,
        message: "Like created successfully!",
        data: {
          likeNumber: Number,
        },
      });
    } else {
      res.json({
        message: "go back the login screen!",
      });
    }
  } catch (err) {
    res.status(500).json({
      code: "9999",
      message: err,
    });
  }
};

module.exports = {
  getLike,
  addPost,
  editPost,
  deletePost,
  getPost,
  // getListPost,
};
