const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authController = require('../controllers/authController');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads'); // Define the destination directory for uploaded files
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension); // Define the filename for uploaded files
    },
  });
  
  // Create multer instance
  const upload = multer({ storage: storage });
router.post('/register',upload.single('profileImage'), authController.register);
router.post('/login', authController.login);
router.get('/delete-user/:id', authController.deleteUser);

router.post('/logout/:id', authController.logout);
router.get('/profile/:id', authController.profile);
router.put('/updateprofile/:id',upload.single('profileImage'), authController.updateprofile);
router.post('/forget_password', authController.forgetpassword);
router.post('/changepassword/:id', authController.changepassword);
router.get('/allregister', authController.allregister);
router.get('/filterstudent/:role', authController.allStudents);
router.get('/all-students', authController.onlyStudent);
router.get('/all-teachers', authController.onlyTeacher);


router.get('/faqs', authController.faqs);
router.get('/teacher-students/:id', authController.allTeacherStudents);
router.get('/teacher-student-by-id/:id', authController.BookingTeacherStudentsById);
router.post('/ticket-raise', authController.TicketRaise);
router.get('/get-tickets', authController.GetTicketRaise);
router.get('/delete-ticket/:id', authController.deleteTicketRaise);
router.post('/update-ticket/:id', authController.updateTicketRaise);

router.get('/student-orders/:id', authController.StudentsOrders);

module.exports = router;