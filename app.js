const express = require("express");
const mysql = require("mysql2");
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');


const PORT = 3306
const app = express();


app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use Morgan middleware for logging HTTP requests
app.use(morgan('dev'));


const server = http.createServer(app);


const io = new Server(server, {
  // allowRequest: (req, callback) => {
  //   const noOriginHeader = req.headers.origin === undefined;
  //   callback(null, noOriginHeader);
  // },
  cors: {
    // origin: "*",
    // origin: "http://localhost:3000",
    // or with an array of origins
    origin: ["http://localhost:3001",  "http://localhost:3000", "http://192.168.29.25:3000"],
    methods: ['GET', 'POST'],  
    credentials: true,
    allowEIO3: true,
  }
});



const db = mysql.createConnection({
  host: 'localhost',
  user: 'cmsfylqm_storyfypro',
  password: 'cmsfylqm_storyfypro',
  database: 'cmsfylqm_storyfypro'
});


db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});


let users=[];
db.query('SELECT * FROM users WHERE role = "teacher"', [], function(error, results, fields) {
  if (error) {
      console.error(error);
      return;
  }
  users = results; 
});




io.on('connection', (socket) => { // socket object may be used to send specific messages to the new connected client
  console.log('new client connected');
  socket.emit('connection', null);
  socket.on('channel-join', id => {
      console.log('channel join', id);
    //   users.forEach(c => {
    //       if (c.id === id) {
    //           if (c.sockets.indexOf(socket.id) == (-1)) {
    //             //   c.sockets.push(socket.id);
    //             //   c.participants++;
    //               io.emit('channel', c);
    //           }
    //       } else {
    //           let index = c.sockets.indexOf(socket.id);
    //           if (index != (-1)) {
    //             //   c.sockets.splice(index, 1);
    //             //   c.participants--;
    //               io.emit('channel', c);
    //           }
    //       }
    //   });

      return id;
  });
  
//   socket.on("connection", (socket) => {
//       const transport = socket.conn.transport.name; // in most cases, "polling"
    
//       socket.conn.on("upgrade", () => {
//         const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
//       });
//     });
    
    socket.on('send-message', message => {
        console.log("Received message:", message);
        const messageTime = new Date(message.send_at).toISOString();
        message.timestamp = messageTime;
        message.seen = false;
        message.content = message.text;
    
        // Execute the database insertion asynchronously
        insertMessage(message)
            .then(() => {
                console.log('Message inserted successfully into the database:', message);
                // Emit the message to all clients
                io.emit('message', message);
            })
            .catch(error => {
                console.error('Error inserting message into the database:', error);
                // Notify the client about the error
                socket.emit('message-error', 'Failed to send message. Please try again.');
            });
    });
  socket.on('disconnect', () => {
    //   users.forEach(c => {
    //       let index = c.sockets.indexOf(socket.id);
    //       if (index != (-1)) {
    //           c.sockets.splice(index, 1);
    //         //   c.participants--;
    //           io.emit('channel', c);
    //       }
    //   });
  });

});

app.io = io;
// Function to insert a message into the database
function insertMessage(message) {
    return new Promise((resolve, reject) => {
        db.execute(
            'INSERT INTO message_tbl (sender_id, receiver_id, conversation_id, content, sent_at, status) VALUES (?, ?, ?, ?, ?, ?)',
            [
                message.senderId,
                message.receiverId,
                message.senderId + '--' + message.receiverId,
                message.text,
                message.send_at,
                0
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

const authRoutes = require('./routes/authRoutes');

const latestRoutes = require('./routes/latestRoutes');
const contactRouters = require('./routes/contactRoutes');
const blogRouters = require('./routes/blogRoutes');
const tutorsRouters = require('./routes/tutorsRoutes');
const countryRouters = require('./routes/countryRoutes');
const speakRouters = require('./routes/speakRouter');
const specialtiesRouters = require('./routes/specialtiesRouter');
const ratingRouters = require('./routes/ratingRouter');
const speakerRouters = require('./routes/speakerRoutes');
const tutorcategoriesRouters = require('./routes/tutorcategoriesRoutes');
const teacherRouters = require('./routes/teacherRoutes');
const slotRouters = require('./routes/slotRoutes');
const certificationRouters = require('./routes/certificationRoutes');
const LevelRouters = require('./routes/levelRoutes');
const scheduleRouters = require('./routes/ScheduleRoutes');
const messageRouter = require('./routes/MessageRoutes');


const errorHandler = require('./middleware/errorHandler');




app.get("/", (req, res) => { res.send("Welcome to MySQL live server storyfy projects"); });
app.get('/getChannels', (req, res) => {
    db.query('SELECT * FROM users WHERE role = "teacher"', [], function(error, results, fields) {
      if (error) {
          console.error(error);
          return;
      }
      
      users = results; 
      res.json({
          channels: users
      })
    });
});
app.use('/api', authRoutes);
app.use('/api', latestRoutes);
app.use('/api', contactRouters);
app.use('/api', blogRouters);
app.use('/api', tutorsRouters);
app.use('/api', countryRouters);
app.use('/api', speakRouters);
app.use('/api', specialtiesRouters);
app.use('/api', ratingRouters);
app.use('/api', speakerRouters);
app.use('/api', tutorcategoriesRouters);
app.use('/api', teacherRouters);
app.use('/api', slotRouters);
app.use('/api', certificationRouters);
app.use('/api', LevelRouters);
app.use('/api', scheduleRouters);
app.use('/api/uploads', express.static('uploads'));
app.use('/api', messageRouter);



app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;