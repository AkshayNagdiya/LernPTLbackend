// routes/blogRoutes.js
const express = require('express');
const router = express.Router();

const slotController = require('../controllers/slotController');
router.post('/createslot/:userid/:productid', slotController.slotbook);
router.get('/slotshow', slotController.slotshow);
router.delete('/slotshow/:id', slotController.deleteslot);
//reviews///
router.post('/reviewscreate/:userid/:productid', slotController.reviewcount);
router.get('/reviewshow', slotController.reviewshow);
router.delete('/reviewshow/:id', slotController.deletereview); 
//reviews End///

// newCode Start HEre
router.post('/create-slots', slotController.slotCreate);
router.put('/update-slots', slotController.updateSlot);
router.get('/get-slots/:id', slotController.getAllSlot);

router.get('/get-slots-by-id/:id', slotController.getSlotById);
router.post('/get-slots-by-id/:id', slotController.getSlotById);

router.get('/get-slots-by-id/:id/:day', slotController.getSlotById);
router.post('/get-slots-by-id/:id/:day', slotController.getSlotById);


router.get('/get-slots-by-day/:id/:day', slotController.getAllSlot);
router.post('/get-slots-by-day/:id/:day', slotController.getAllSlot);
router.post('/book-slot', slotController.bookSlot);
router.delete('/delete-slot/:id', slotController.deleteSlot);
module.exports = router;
