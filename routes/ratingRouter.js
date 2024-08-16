// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const ratingController = require('../controllers/ratingController');
router.post('/createrating', ratingController.ratingCreate);
router.get('/ratingshow', ratingController.ratingshow);
router.get('/ratingshow/:id', ratingController.ratingshowbyid);
router.delete('/ratingdelete/:id', ratingController.ratingdelete);
router.put('/updaterating/:id',  ratingController.updatesrating);

module.exports = router;
