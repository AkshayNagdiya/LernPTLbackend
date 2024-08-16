// const path = require('path');
// const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const mysql = require('mysql2');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

// Load database credentials from a configuration file or use environment variables
const dbConfig = {
  host: 'localhost',
  user: 'cmsfylqm_storyfypro',
  password: 'cmsfylqm_storyfypro',
  database: 'cmsfylqm_storyfypro'
};

const db = mysql.createConnection(dbConfig);


exports.RecentList = async (req, res) => {
    try {
        const userId = req.params.id;
        const query = "SELECT U.firstname,U.lastname, M.message_id, M.sender_id, M.receiver_id, M.content, M.status, M.conversation_id FROM message_tbl M INNER JOIN users U ON U.id = M.sender_id WHERE receiver_id = ? GROUP BY M.sender_id ORDER BY M.created_at DESC";
        console.log(query)
        db.query(query, [userId], (error, results, fields) => {
            if (error) {
                console.error('Error fetching recent messages:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            
            if (results.length === 0) {
                return res.status(400).json({ message: 'No recent messages found' });
            }
            
            res.status(200).json({ data: results, message: 'successfully' });
        });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error'+error });
    }
};



exports.RecentMessages = async (req, res) => {
    try {
        
        const {senderId,receiverId} = req.params;

        let conversationId1 =  senderId+"--"+receiverId
        let conversationId2 =  receiverId+"--"+senderId

        const query = "SELECT U.firstname, U.lastname, M.message_id, M.sender_id, M.receiver_id, M.content, M.status, M.conversation_id, M.created_at FROM message_tbl M INNER JOIN users U ON U.id = M.sender_id WHERE M.conversation_id IN(?) ORDER BY created_at ASC";
        console.log(query)
        db.query(query, [[conversationId1,conversationId2]], (error, results, fields) => {
            if (error) {
                console.error('Error fetching recent messages:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            
            if (results.length === 0) {
                return res.status(400).json({ message: 'No recent messages found' });
            }
            
            res.status(200).json({ data: results, message: 'successfully' });
        });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// exports.sendMessage = async (req, res) => {
//     try {
//         // console.log(req)
//         const { text, userId, teacherId } = req.body;
//         // return res.status(200).json({ message: req.body });
//         // Process text message
//         console.log('Text message:', text);
//         console.log('User ID:', userId);
//         console.log('Teacher ID:', teacherId);
        
//         // Process image
//         // if (req.file) {
//             //     // const imageFile = req.file;
//         //     // console.log('Image uploaded:', imageFile.originalname);
//         //     // // Move uploaded image to desired directory
//         //     // const newName = uuidv4() + path.extname(imageFile.originalname);
//         //     // const newPath = path.join(__dirname, '..', 'uploads', newName);
//         //     // await fs.promises.rename(imageFile.path, newPath);
//         // }
        
//         // Emit the message to the respective user (teacher)
//         req.app.io.to(teacherId).emit('newMessage', { text, userId });
        
//         // Respond with success message
//         res.status(200).json({ message: 'Message sent successfully' });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
