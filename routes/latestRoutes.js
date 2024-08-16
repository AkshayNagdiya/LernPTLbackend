const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const latestController = require('../controllers/latestController');
// new controller
const FilterController = require('../controllers/FilterController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        let filefieldname = file.fieldname.replaceAll('[','').replaceAll(']','');
        cb(null, filefieldname + '-' + uniqueSuffix + fileExtension);
    },
});

const upload = multer({ storage: storage });

// router.post('/latest/new', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), latestController.createLatest);
router.post('/latest/new', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'certificateuploadPhoto[]', maxCount: 5 },{ name: 'contactsEducation[]', maxCount: 5 }]), latestController.createLatest);
router.get('/latest', latestController.getAllLatest);
router.get('/latest/:id', latestController.getLatestById);
router.delete('/latest/:id', latestController.deleteLatest);
router.post('/verifired/:id', latestController.verifired);
router.patch('/schedulepatch/:id', latestController.patchSchedule);
router.patch('/educationpatch/:id', latestController.patchEducation);
router.patch('/certificatepatch/:id', latestController.patchcertificate);
router.patch('/speakpatch/:id', latestController.patchspeak);
router.get('/latestfilter/:techearid', latestController.latestFilter);
// router.get('/speak', latestController.speakAllLatest);
// router.get('/specialties', latestController.specialtiesAllLatest);
// router.get('/level', latestController.levelAllLatest);
router.put('/latest/:id',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), latestController.updateLatest);
router.post('/wishlist/:userId/:productId',latestController.addToWishlist);
router.get('/wishlistshow/:userId', latestController.getWishlistDataForUser);
router.delete('/wishlistdelete/:userId/:productId', latestController.getWishlistDatadelete);

router.patch('/latest-update/:id',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'certificateuploadPhoto[]', maxCount: 5 },{ name: 'contactsEducation[]', maxCount: 5 }]), latestController.updateLatestByPatch);

// newcode
router.get('/latest-filter', FilterController.FilterAllLatest);

module.exports = router;