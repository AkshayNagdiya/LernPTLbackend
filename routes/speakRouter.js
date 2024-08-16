// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const speakController = require('../controllers/speakController');

router.post('/create-subject', speakController.subjectCreate);
router.get('/subject-show', speakController.subjectShow);
router.delete('/subject-delete/:id', speakController.subjectDelete);
router.get('/subject-show/:id', speakController.subjectShowbyid);
router.put('/update-subject/:id',  speakController.updatesSubject);

router.post('/createspeak', speakController.speakcreate);
router.get('/speakshow', speakController.speakshow);
router.get('/speakshow/:id', speakController.speakshowbyid);
router.delete('/speakdelete/:id', speakController.speakdelete);
router.put('/updatespeak/:id',  speakController.updatesspeak);

module.exports = router;
