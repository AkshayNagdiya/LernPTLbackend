// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const blogController = require('../controllers/blogController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
}); 

const upload = multer({ storage: storage });
router.post('/createblog', upload.single('image'), blogController.blogcreate);
router.get('/blogshow', blogController.blogshow);
router.get('/blogshow/:id', blogController.blogshowbyid);
router.delete('/blogdelete/:id', blogController.blogdelete);
router.put('/updateblog/:id', upload.single('image'), blogController.updatesblog);
router.post('/blogcategories',blogController.blogcategories)
router.get('/blogshowcategory', blogController.blogshowcategory);


module.exports = router;
