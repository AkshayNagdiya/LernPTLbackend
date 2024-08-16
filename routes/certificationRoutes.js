// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const certificationController = require('../controllers/certificationController');
router.post('/createcertification', certificationController.certificationcreate);
router.get('/certificationshow', certificationController.certificationshow);
router.get('/certificationshow/:id', certificationController.certificationshowbyid);
router.delete('/certificationdelete/:id', certificationController.certificationdelete);
router.put('/updatecertification/:id',  certificationController.updatescertification);

module.exports = router;
