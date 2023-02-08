import Post from "../models/posts";
import AccountModel from "../models/accounts";
import { verifyJwtToken } from '../helper/utils';
import UserModel from "../models/users"
import e from "express";

const TRUE_STATUS = ["happy", "angry", "sad"];

const getInfoUser = async (token) => {
  try {
    await AccountModel.findOne({token})
    .then((data) => { 
      if(data) {
        return data;
      }
    })
  } catch (err) {
    console.log(err);
  }
}

// List API used for Post Status
/**
 * @author dunglda
 * @description add a post after login 
 * @param {Object} req
 * @param {Object} res
 * @returns {string}
 */
const addPost = async (req, res) => {

    const { token, described, status } = req.body;
    if (!token) {
      return res.json({
        code: "1002",
        message: "Parameter is not enough",
      });
    }
    
    if ( 
      typeof token !== "string" ||
      typeof described !== "string" ||
      typeof status !== "string"
    ) {
      res.status(422).json({ message: "Invalid data"})
      return;
    }

    try {
      
      await verifyJwtToken(token, process.env.jwtSecret).then(async () => {
        const truePost = TRUE_STATUS.includes(status) && (described !== "");
        let imageArray = [];
        imageArray.push(req.file.path);

        if (truePost) {
          const savedPost = new Post({
            image: imageArray ?? '',
            video: [] ?? '',
            described: described ?? '' ,
            status: status ?? '',
            banned: 0,
            likes: [],
          })

          const post = await savedPost.save();

          return res.status(200).json({
            code: "1000",
            message: "Post created successfully!",
            data: {
              id: post.id ?? '',
              url: post.url ?? '',
            },
          }); 
        } else {
          res.status(400).json({
            code: "1001",
            message: "Post created failed! Check parameters!"
          })
        }

      }).catch(err => {
        return res.json({
          code: '1005',
          message: 'expired token, go to login page' + err,
        })
      })
    } catch (err) {
        res.status(500).json({
          code: "9999",
          message: "Server failed to post!" + err,
        });
    }  
}

// const editPost = async (req, res) => {
  
//   const { token, id, described, status, image, image_del, image_sort, video, thumb, auto_accept, auto_block } = req.body;
//   if(!userId && !accept_block)

//   try {
    
//     const post = await Post.findById(req.params.id);

//     if(post.userId === userId && accept_block === 0 ) {
        
//         await post.updateOne({ $set: req.body });
        
//         res.status(200).json({
//             code: 1000,
//             message: "your post has been update",
//         });   
//     } else if(accept_block === 1) {
//       res.json({
//         code: 1010,
//         message: "Your content is inappropriate!"
//       })
//     } else {
//       res.status(403).json("You can update only your post");  
//     }

//   } catch (error) {
//     res.status(500).json(error);
//   }
// }

const deletePost = async (req, res) => {
    try {
        const { token, id } = req.body;
        
        if (!token || !id) {
          return res.json({
            code: "1002",
            message: "Parameter is not enough",
          });
        } else {
          await verifyJwtToken(token, process.env.jwtSecret)
          .then(async () => {

            const user = await AccountModel.findOne({token});
            if (user) {
              if ( user.is_blocked === 1 ) {
                return res.json({
                  code: '1005',
                  message: 'expired token, go to login page' + err,
                })
              }
            }

            const post = await Post.findById(id);
            if (!post) {
              res.status(403).json({
                code: 9992,
                message: "post is not existed"
              });
              return;
            } else {
              if (post.banned === "1" || post.banned === "2") {
                res.json({
                  code: 9992,
                  message: 'the post is banned!'
                });

                await post.deleteOne();
                return;
              } else {
                await post.deleteOne();
                return res.status(200).json({
                  code: 1000,
                  message: "the post has been deleted"
                })
              }
            }   
     
          }).catch(err => {
            return res.json({
              code: '1005',
              message: 'expired token, go to login page' + err,
            });
          });
        }
        
    } catch (err) {
        res.status(500).json({
          code: 1001,
          message: "Your internet is disconnected!"
        });
    }
}

const reportPost = async (req, res) => {
  try {
    const { token, id, subject, details } = req.body;

    const SUBJECT = ["Bạo lực", "Khỏa thân", "Chất cấm"];
    const trueReport = SUBJECT.includes(subject);


    if (!(token || id || subject || details)) {
      return res.json({
        code: "1002",
        message: "Parameter is not enough",
      });
    }
    
    if ( 
      typeof token !== "string" ||
      typeof id !== "string" ||
      typeof subject !== "string" ||
      typeof details !== "string"      
    ) {
      res.status(422).json({ message: "Invalid data"})
      return;
    } else {
      await verifyJwtToken(token, process.env.jwtSecret)
          .then(async () => {

            const user = await AccountModel.findOne({token});
            if (user) {
              if (user.is_blocked === 1 ) {
                return res.json({
                  code: '1005',
                  message: 'expired token, go to login page' + err,
                })
              }
            }

            const post = await Post.findById(id);
            if (!post) {
              res.status(403).json({
                code: 9992,
                message: "post is not existed"
              });
              return;
            } else {
              if (post.banned === "1" || post.banned === "2") {
                res.json({
                  code: 9992,
                  message: 'the post is banned!'
                });

                await post.deleteOne();
                return;
              } else {

                post.update({banned}, {$set: {banned: '1'}});

                return res.status(200).json({
                  code: 1000,
                  message: "the post has reported successfully!"
                })
              }
            }   
     
          }).catch(err => {
            return res.json({
              code: '1005',
              message: 'expired token, go to login page' + err,
            });
          });
    }

    
  } catch (err) {
    res.status(500).json({
      code: 1001,
      message: "your internet is disconnected!"
    });
  }
}

// const getPost = () => async (req,res) => {
//   try {
//     const { token, id } = req.body;

//     const trueAccessToken = await existAccessToken(token);
//     if (trueAccessToken) {
//       const post = await Post.findById(id);
      
//       if(post) {
//         return res.status(200).json({
//           code: "1000",
//           message: "Get a post successful",
//           data: {
//             id: 
//             described:
            
//           }
//         })
//       }
//     }

//   }
//   catch (err) {
//     console.log(err);
//   }
// }

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

// Comments 
const get_comment = async (req, res) => {
  const postComments = comments.filter(comment => comment.postId === id);

  if (index && count) {
    const start = index * count;
    const end = start + count;
    const limitedPostComments = postComments.slice(start, end);
    return res.json({ success: true, code: 1000, message: 'OK', comments: limitedPostComments });
  }
}


const setComment = async (req, res) => {
  try {
    const { token, id, comment, index, count } = req.body;
    if (!token || !id || !comment || !index || !count) {
      return res.json({
        code: "1002",
        message: "Parameter is not enough",
      });
    } 

    if ( 
      typeof token !== "string" ||
      typeof id !== "string" ||
      typeof comment !== "string" ||
      typeof Number(index) !== "number" ||
      typeof Number(count) !== "number" 
    ) {
      res.status(422).json({ message: "Invalid data"})
      return;
    } else {
      await verifyJwtToken(token, process.env.jwtSecret)
          .then(async () => {

            const account = await AccountModel.findOne({token});
            const userId = account._id;
            const user = await UserModel.findOne({ id: account._id });
            console.log(user);
            if (user) {
              if (user.is_blocked === 1 ) {
                return res.json({
                  code: '1005',
                  message: 'expired token, go to login page' + err,
                })
              }
            }

            const post = await Post.findById(id);
            if (!post) {
              res.status(403).json({
                code: 9992,
                message: "post is not existed"
              });
              return;
            } else {
              if (post.banned === "1" || post.banned === "2") {
                res.json({
                  code: 9992,
                  message: 'the post is banned!'
                });

                await post.deleteOne();
                return;
              } else {

                const userId = user._id.toString();
                const username = user.username;
                console.log(username);
                const userAvatar = user.avatar;

                const new_comment = {
                  poster: {
                    id: userId ?? "",
                    name: username ?? "",
                    avatar: userAvatar ?? "",
                  },
                  comment: comment,
                  timestamp: new Date(),
                };
                console.log(new_comment);
                post.comments.push(new_comment);

                try {
                  post.save();
                } catch (err) {
                  console.log(err);
                  res.status(500).json({ msg: err });
                  return;
                }
                
                return res.status(200).json({ 
                  code: "1000",
                  message: "set comment success!",
                  data: {
                    id: post._id || "",
                    comment: post.comments[0].comment,
                    created: post.comments[0].timestamp,
                    poster: {
                      id: post.comments[0].poster.id,
                      name: post.comments[0].poster.name,
                      avatar: post.comments[0].poster.avatar
                    },
                    is_blocked: user.is_blocked ?? "",
                  }
                });

              }
            }  
          }).catch(err => {
            return res.json({
              code: '1005',
              message: 'expired token, go to login page' + err,
            });
          });
        }

  } catch (err) {
    res.status(500).json({
      code: 1001,
      message: "your internet is disconnected!" + err,
    });
  }
}

const like = async (req, res) => {
    const { token, id } = req.body;
    if (!token || !id) {
      return res.json({
        code: "1002",
        message: "Parameter is not enough",
      });
    }

    if ( 
      typeof token !== "string" ||
      typeof id !== "string" 
    ) {
      res.status(422).json({ message: "Invalid data"})
      return;
    } else {
      
      await verifyJwtToken(token, process.env.jwtSecret)
      .then(async () => {
        let postFind = null;
        try {
          postFind = await Post.findById(id);
        } catch (err) {
          res.json({msg: err});
          return;
        }

        if (postFind === null) {
          res.status(422).json({message: "Not found post!"})
          return;
        }

        const userId = await UserModel.findOne({token});
        // Nếu likes[] chứa userid thì unlike, ngược lại thì like 
        if (userId && postFind.likes.includes(userId.id)) {
          let newLikes = postFind.likes.filter((item) => item !== userId.id);
          postFind.likes = newLikes;
        } else {
          postFind.likes.push(userId.id);
        }
        
        try {
          await postFind.save();

          return res.status(200).json({
              code: "1000",
              message: "like/unlike successfully!",
              data: {
                like: postFind.likes.length,
              }
          });
        } catch {
          res.status(500).json({msg: "Not connect Internet"});
          return;
        }

      }).catch(err => {
        return res.json({
          code: '1005',
          message: 'expired token, go to login page' + err,
        });
      });
  }
}


module.exports = {
    addPost,
    // editPost,
    deletePost,
    // getPost,
    reportPost,
    // getListPost, 
    like,
    setComment,
}
