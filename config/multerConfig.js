// const multer = require('multer')
// const path = require('path')
// const crypto = require('crypto')

// // disk storage 
// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, './public/images/uploads')
// //   },
// //   filename: function (req, file, cb) {
// //     crypto.randomBytes(12, (err, byttes) => {
// //         const fileName = byttes.toString("hex") + path.extname(file.originalname)
// //         cb(null, fileName)
// //     })
// //   }
// // })
// const storage = multer.memoryStorage();

// // export module variable
// const upload = multer({ storage: storage })

// module.exports = upload

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
module.exports = upload;
