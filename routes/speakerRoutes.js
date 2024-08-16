// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const speakerController = require('../controllers/speakerController');

router.post('/createspeaker', speakerController.speakercreate);


module.exports = router;
