// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacherController');

 

router.post('/teacheradd', teacherController.teachercreate);
router.get('/teacher', teacherController.teachershow);

module.exports = router;
