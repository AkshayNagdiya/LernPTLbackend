const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/contact', contactController.createContact);
router.get('/contactshow', contactController.getAllContact);
router.get('/contactshow/:id', contactController.contacthowbyid);
router.delete('/contact/:id', contactController.deleteContact);
router.put('/contact/:id', contactController.updateContact);
module.exports = router;
