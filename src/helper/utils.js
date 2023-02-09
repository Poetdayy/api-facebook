import multer from "multer";
const jwt = require('jsonwebtoken');


/**
 * @author hieubt
 * @param {string} token 
 * @returns {Promise}
 */
const verifyJwtToken = (token, secretKey) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return reject(err);
            } else {
                resolve(decoded);
            }
        })
    })
}


/**
 * @description use multer library to upload image
 * @author dunglda
 * @param {string} token 
 * @returns {Promise}
 */
const storageImg = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const storageVideo = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/videos');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});

const fileFilterImg = (req, file, cb) => {
    // hàm này sẽ gọi callback `cb` với 1 biến boolean
    // để chỉ ra rằng file có được chấp nhận hay không
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
}

const fileFilterVideo = (req, file, cb) => {
    if(file.mimetype === 'video/mp4'){
        cb(null,true);
    }else{
        cb({message: 'Unsupported File Format'}, false)
    }
};

const uploadImage = multer({
    storage: storageImg,
    limits: {
        fileSize: 4096*4096,
    },
    fileFilter: fileFilterImg
}).single("image");

const uploadVideo = multer({
    storage: storageVideo,
    fileFilter: fileFilterVideo
}).single("video");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

// change the allowed upload type
const setAllowUploadType = (type) => {
  if (type === 'image') {
    uploadImage
  } else if (type === "video") {
    uploadVideo
  } else {
    throw new Error('Invalid upload type. Must be either image or video.');
  }
};


module.exports = { 
    verifyJwtToken,
    uploadImage,
    uploadVideo,
    setAllowUploadType
};
