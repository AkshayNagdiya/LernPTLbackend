// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const tutorcategoriesController = require('../controllers/tutorcategoriesController');

router.post('/createtutorcategories', tutorcategoriesController.tutorcategoriescreate);


module.exports = router;
