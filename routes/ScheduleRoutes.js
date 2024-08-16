// routes/schedule.js
const express = require('express');
const router = express.Router();

const SchedulesController = require('../controllers/ScheduleController');

router.post('/createschedule/:id', SchedulesController.createschedule);


module.exports = router;
