// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const specialtiesController = require('../controllers/specialtiesController');
router.post('/specialtiescreate', specialtiesController.specialtiescreate);
router.get('/specialtiesshow', specialtiesController.specialtiesshow);
router.get('/specialtiesshow/:id', specialtiesController.specialtiesshowbyid);
router.delete('/specialtiesdelete/:id', specialtiesController.specialtiesdelete);
router.put('/updatespecialties/:id',  specialtiesController.updatesspecialties);

module.exports = router;
