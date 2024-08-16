// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const tutorsController = require('../controllers/tutorsController');
router.post('/createtutors', tutorsController.tutorscreate);
router.get('/tutorsshow', tutorsController.tutorsshow);
router.get('/tutorsshow/:id', tutorsController.tutorsshowbyid);
router.delete('/tutorsdelete/:id', tutorsController.tutorsdelete);
router.put('/updatetutors/:id',  tutorsController.updatestutors);
router.get('/tutorsshowcount',  tutorsController.tutorsshowcount);


module.exports = router;
 