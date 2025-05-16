const express = require('express');
const router = express.Router();
const userController = require('../src/controllers/userController');
const { authenticate } = require('../src/middlewares/auth');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, `${req.user.id}_${Date.now()}.${ext}`);
  }
});
const upload = multer({ storage });

// Avatar upload endpoint
router.post('/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;