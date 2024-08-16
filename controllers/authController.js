const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/user');
const path = require('path');
const fs = require('fs');
// const db = require('../models/latest');
const nodemailer = require('nodemailer');
const { EMAIL_USE_TLS, EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD } = process.env;
// Create a transporter using Gmail's SMTP server
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: EMAIL_PORT,
  secure: parseInt(EMAIL_PORT) === 465,
  auth: {
    user: 'tarunbirla2018@gmail.com',
    pass: 'lervdzktkcpewuuo',
  },
});

const loggedInUsers = new Set();



const register = async (req, res) => {
  let { email, password, firstname, lastname, mobileNumber, code, role, nativelanguage} = req.body;

  try {
 

    if (!email || !password  || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    if(code !== '' && code !== undefined){
        return res.send({code:(typeof code)})
        const [existingCode] = await db.query('SELECT * FROM users WHERE referral_code = ?', [code]);
        console.log('existingCode',existingCode);
        if (existingCode.length == 0) {
            return res.status(400).json({ success: false, message: 'Invalid referral code' });
        }
    }else{
        code = ''
    }
    
    if(nativelanguage == undefined){
        nativelanguage = ''
    }
        

    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userImage = req.file ? req.file.filename : null;

    const referralCode = await generateReferralCode();
    console.log("referralCode =========>",referralCode)

    await db.query('INSERT INTO users (email, password, firstname, lastname, mobileNumber, code, referral_code, role, profileImage, native_speak) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, firstname, lastname, mobileNumber, code, referralCode, role, userImage, nativelanguage]);

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const generateReferralCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let referralCode = '';
  for (let i = 0; i < 8; i++) {
    referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  const [existingUser] = await db.query('SELECT * FROM users WHERE referral_code = ?', [referralCode]);
  if (existingUser.length > 0) {
    // If the referral code already exists, recursively call the function to generate a new one
    return generateReferralCode();
  }
  
  return referralCode;
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (user.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user[0].role == 'teacher') {
        if (user[0].status === 0) {
          return res.status(401).json({ success: false, message: 'User unverified' });
        }
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user[0].id, userName: user[0].firstname+" "+user[0].lastname, role: user[0].role }, 'secret_key', { expiresIn: '1h' });
    res.status(200).json({ success: true, message: 'Login successful', token, userid: user[0].id, userName: user[0].firstname+" "+user[0].lastname, role: user[0].role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const allregister =async(req,res)=>{
  try {
    // Fetch all registered users from the database
    const [users] = await db.query('SELECT id, email, firstname, lastname, mobileNumber, status, code, role, profileImage FROM users');

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

const allStudents = async (req, res) => {
  try {
    const { role } = req.params;

    let query = 'SELECT id, email, firstname, lastname, mobileNumber, code, role, profileImage FROM users WHERE role = ?';
    const values = [role];

    const [students] = await db.execute(query, values);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found for the given role' });
    }

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const updateprofile = async (req, res) => {
  const userId = req.params.id;
  const { email, password, firstname, lastname, mobileNumber, code, timezone, status } = req.body;

  try {
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user || user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let hashedPassword = user[0].password; // Default to existing password

    // Check if password is provided and hash it if it is
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    // Check if any parameter is blank or null, and update only if provided
    const updateParams = [];
    const updateFields = [];

    if (email) {
        updateParams.push(email);
        updateFields.push('email = ?');
    }
    if (password) {
        updateParams.push(hashedPassword);
        updateFields.push('password = ?');
    }
    if (firstname) {
        updateParams.push(firstname);
        updateFields.push('firstname = ?');
    }
    if (lastname) {
        updateParams.push(lastname);
        updateFields.push('lastname = ?');
    }
    if (mobileNumber) {
        updateParams.push(mobileNumber);
        updateFields.push('mobileNumber = ?');
    }
    if (code) {
        updateParams.push(code);
        updateFields.push('code = ?');
    }
    if (req.file) {
        updateParams.push(req.file.filename);
        updateFields.push('profileImage = ?');
    }
    if (timezone) {
        updateParams.push(timezone);
        updateFields.push('timezone = ?');
    }
    
    if (status) {
        updateParams.push(status);
        updateFields.push('status = ?');
    }

    if (updateParams.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    // Construct SQL query dynamically based on provided fields
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    updateParams.push(userId);

    // Execute the update query
    await db.query(updateQuery, updateParams);

    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};



// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

//     if (user.length === 0) {
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     const passwordMatch = await bcrypt.compare(password, user[0].password);

//     if (!passwordMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     const token = jwt.sign({ userId: user[0].id }, 'secret_key', { expiresIn: '1h' });
//     loggedInUsers.add(user[0].id);
//     res.status(200).json({ success: true, message: 'Login successful', token, userid: user[0].id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// };

const logout = (req, res) => {
  const userId = req.params.id;
  loggedInUsers.delete(userId);

  res.status(200).json({ success: true, message: 'Logout successful' });
};

const profile = async (req, res) => {
  const userId = req.params.id;

  try {
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userProfile = {
      id: user[0].id,
      email: user[0].email,
      firstname: user[0].firstname,
      lastname: user[0].lastname,
      mobileNumber: user[0].mobileNumber,
      code: user[0].code,
      password: user[0].password,
      profileImage: user[0].profileImage,
      timezone: user[0].timezone,
      referral_code: user[0].referral_code,
      native_speak: user[0].native_speak,
      // Add other user properties as needed
    };

    res.status(200).json({ success: true, user: userProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    // Send mail with defined transport object
    await transporter.sendMail({

      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Rethrow the error to handle it at the calling site if needed
  }
};

const forgetpassword = async (req, res) => {
  const { email} = req.body;

  try {
    const [user] = await db.query('SELECT id, email FROM users WHERE email = ?', [email]);

    if (!user || user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userID = user[0].id;

    // Store the user ID in your database
    await db.query('UPDATE users SET reset_user_id = ?, resettokenexpires = NOW() + INTERVAL 1 HOUR WHERE id = ?',
      [userID, userID]);

    // Send an email with the password reset link
    const resetLink = `https://storyfi.hireactjob.in/changepassword/${userID}`;
    const emailSubject = 'Password Reset Link';
    const emailHTML = `Click the following link to reset your password: <a href="${resetLink}">${resetLink}</a>`;

    await sendEmail(user[0].email, emailSubject, emailHTML);

    res.status(201).json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const changepassword = async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;

  try {
    // Check if the user with the given ID exists
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user || user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update the user's password in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


const faqs = async (req, res) => {
  try {
    let { status } = req.body;
    // console.log(status,'sdsadasdsadsa==========>')
    if(status == '' || status == undefined){
      // return res.status(400).json({ success: false, message: 'Status is required' });
      status = 1
    }
    
    let query = 'SELECT * FROM faq WHERE status = ?';
    const values = [status];

    const [faqData] = await db.execute(query, values);

    if (faqData.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    res.status(200).json({ success: true, faqData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}


const onlyStudent = async (req, res) => {
  try {

    let query = 'SELECT id, email, firstname, lastname, mobileNumber, code, role, profileImage, timezone, native_speak, referral_code, "0" as course_enroll FROM users WHERE role = ?';
    const values = ["student"];

    const [students] = await db.execute(query, values);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found for the given role' });
    }

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}


const onlyTeacher = async (req, res) => {
  try {

    let query = 'SELECT id, email, firstname, lastname, mobileNumber, code, role, profileImage FROM users WHERE role = ?';
    const values = ["teacher"];

    const [teachers] = await db.execute(query, values);

    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'No teachers found for the given role' });
    }

    res.status(200).json({ success: true, teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}


const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Attempt to delete the user
        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        // Check if the error is due to foreign key constraint violation
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: "Cannot delete user because it is referenced in other tables" });
        }
        
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const TicketRaiseSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  issue:Joi.string().required(),
  descriptions:Joi.string().required(),
  user_id:Joi.number().required(),
});

const TicketRaise = async (req, res) => {
  try {
    const { error } = TicketRaiseSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }  

    let { name, email, issue, descriptions, user_id} = req.body;
    
    const query = 'INSERT INTO ticket_raise_tbl (name, email, issue, descriptions, status, user_id) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await db.query(query, [name,email,issue,descriptions, 'open', user_id]);
    let lastId  = result[0].insertId;

    res.status(200).json({ success: true, message: 'Ticket Created Successfully.',ticketId:lastId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const GetTicketRaise = async (req, res) => {
  try {
    
    const query = 'SELECT * FROM ticket_raise_tbl ';
    const values = [];

    const [tickets] = await db.execute(query, values);

    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'No tickets found' });
    }

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const deleteTicketRaise = async (req, res) => {
  try {
     const ticketId = req.params.id;
    // Attempt to delete the user
        const [result] = await db.execute('DELETE FROM ticket_raise_tbl WHERE id = ?', [ticketId]);

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const updateTicketRaise = async (req, res) => {
  const ticketId = req.params.id;
  const { status } = req.body;

  try {
    const [ticket] = await db.query('SELECT * FROM ticket_raise_tbl WHERE id = ?', [ticketId]);

    if (!ticket || ticket.length === 0) {
      return res.status(404).json({ success: false, message: 'ticket not found' });
    }
    
    const updateParams = [];
    const updateFields = []; 
   
    if (status) {
        updateParams.push(status);
        updateFields.push('status = ?');
    }
    
    if (updateParams.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    // Construct SQL query dynamically based on provided fields
    const updateQuery = `UPDATE ticket_raise_tbl SET ${updateFields.join(', ')} WHERE id = ?`;
    updateParams.push(ticketId);

    // Execute the update query
    await db.query(updateQuery, updateParams);

    res.status(200).json({ success: true, message: 'ticket updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};



const allTeacherStudents = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `SELECT
                    U.firstname,
                    U.lastname,
                    U.id AS student_id,
                    U.mobileNumber,
                    U.email,
                    L.name,
                    L.price,
                    L.image,
                    B.id,
                    B.slot_id,
                    B.transaction_id,
                    B.transaction_status
                FROM
                    booking B
                INNER JOIN users U ON
                    U.id = B.user_id
                INNER JOIN latest L ON
                    L.techearid = B.teacher_id
                Where B.teacher_id = ?`;
    const values = [id];

    const [students] = await db.execute(query, values);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found for the given id' });
    }

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}
const BookingTeacherStudentsById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `SELECT
                    U.firstname,
                    U.lastname,
                    U.id AS student_id,
                    U.mobileNumber,
                    U.email,
                    L.name,
                    L.price,
                    L.image,
                    B.id,
                    B.slot_id,
                    B.transaction_id,
                    B.transaction_status
                FROM
                    booking B
                INNER JOIN users U ON
                    U.id = B.user_id
                INNER JOIN latest L ON
                    L.techearid = B.teacher_id
                Where B.id = ?`;
    const values = [id];

    const [students] = await db.execute(query, values);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found for the given id' });
    }

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const StudentsOrders = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `SELECT
                    U.firstname,
                    U.lastname,
                    L.name,
                    L.price,
                    L.image,
                    B.id,
                    B.transaction_id,
                    B.transaction_status
                FROM
                    booking B
                INNER JOIN users U ON
                    U.id = B.user_id
                INNER JOIN latest L ON
                    L.techearid = B.teacher_id
                Where B.user_id = ?`;
    const values = [id];

    const [students] = await db.execute(query, values);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found for the given id' });
    }

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
} 

module.exports = {
  register,
  login,
  logout,
  profile,
  forgetpassword,
  changepassword,
  updateprofile,
allregister,
allStudents,
onlyStudent,
faqs,
TicketRaise,
  GetTicketRaise,
  deleteTicketRaise,
  updateTicketRaise,
allTeacherStudents,
BookingTeacherStudentsById,
StudentsOrders,
onlyTeacher,
deleteUser
};