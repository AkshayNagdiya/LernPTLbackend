// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const tutorsController = require('../controllers/countryController');

router.post('/createcountry', tutorsController.countrycreate);
router.get('/countryshow', tutorsController.countryshow);
router.get('/countryshow/:id', tutorsController.countryshowbyid);
router.delete('/countrydelete/:id', tutorsController.countrydelete);
router.put('/updatecountry/:id',  tutorsController.updatescountry);

module.exports = router;
