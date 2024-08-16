// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const levelController = require('../controllers/levelController');
router.post('/createlevel', levelController.levelcreate);
router.get('/levelshow', levelController.levelshow);
router.get('/levelshow/:id', levelController.levelshowbyid);
router.delete('/leveldelete/:id', levelController.leveldelete);
router.put('/updatelevel/:id',  levelController.updateslevel);

module.exports = router;
