const multer = require("multer");

// Create memory storage
const storage = multer.memoryStorage();

// File filter to check for image type (jpg, jpeg, png, gif)
const fileFilter = (req, file, cb) => {
  // Check the MIME type of the file
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Only image files are allowed'), false);  // Reject the file
  }
};

// Set the maximum file size (500KB = 500 * 1024 bytes)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024  // 500 KB
  }
});

module.exports = { upload };
