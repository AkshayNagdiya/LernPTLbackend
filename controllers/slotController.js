// controllers/slotController.js
const Joi = require('joi');
const slotsdata = require('../models/slot');
const UserSlots = require('../models/users_slots');
const latestModel = require('../models/latest');
const db = require('../models/user');

//slot///

const slotbook = async (req, res) => {
    try {
        const userId = req.params.userid;
        const productId = req.params.productid;

        // Check if the slot is available
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const [latestResult] = await latestModel.execute('SELECT * FROM latest WHERE id = ?', [productId]);

        const [existingSlot] = await slotsdata.execute('SELECT * FROM Slots WHERE user_id = ? AND product_id = ? AND SelectDate = ?', [userId, productId, req.body.SelectDate]);

        if (existingSlot.length > 0) {
            res.status(400).json({ success: false, message: 'Slot already booked for this date' });
            return;
        }

        const [bookedSlot] = await slotsdata.execute('INSERT INTO Slots (user_id, product_id, SelectDate, Type, time, Hours) VALUES (?, ?, ?, ?, ?, ?)', [
            userId,
            productId,
            req.body.SelectDate, // Replace with your actual date from the request
            req.body.Type, // Replace with your actual type from the request
            req.body.time, // Replace with your actual time from the request
            req.body.Hours, // Replace with your actual hours from the request
        ]);

        // Increment the review count in the latest table only when a new slot is successfully created
        if (bookedSlot.affectedRows > 0) {
            await latestModel.execute('UPDATE latest SET slotbookCount = slotbookCount + 1 WHERE id = ?', [productId]);
        }

        res.status(201).json({ success: bookedSlot.affectedRows > 0, slot: bookedSlot.insertId, latestUpdate: latestResult.affectedRows, userslot: user.affectedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
    }
};

const slotshow = async (req, res) => {
    try {
        const [slots] = await slotsdata.execute('SELECT * FROM Slots');

        if (slots.length === 0) {
            res.status(404).json({ success: false, message: 'No slots found' });
        }

        res.status(200).json({ success: true, slots });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
    }
};

const deleteslot = async (req, res) => {
    try {
        const productId = req.params.id;

        const [result] = await slotsdata.execute('DELETE FROM Slots WHERE id = ?', [productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Slots not found" });
        }

        res.status(200).json({ success: true, message: "Slots deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

//slot End///


//reviews///

const reviewcount = async (req, res) => {
    try {
        const userId = req.params.userid;
        const productId = req.params.productid;

        // Check if the slot is available
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const [latestResult] = await latestModel.execute('SELECT * FROM latest WHERE id = ?', [productId]);

        const [existingSlot] = await slotsdata.execute('SELECT * FROM reviews WHERE user_id = ? AND product_id = ? AND reviews = ?', [userId, productId, req.body.reviews]);

        if (existingSlot.length > 0) {
            res.status(400).json({ success: false, message: 'review already' });
            return;
        }

        const [bookedSlot] = await slotsdata.execute('INSERT INTO reviews (user_id, product_id, reviews) VALUES (?, ?, ?)', [
            userId,
            productId,
            req.body.reviews, // Replace with your actual date from the request
        ]);

        // Increment the review count in the latest table only when a new slot is successfully created
        if (bookedSlot.affectedRows > 0) {
            await latestModel.execute('UPDATE latest SET review = review + 1 WHERE id = ?', [productId]);
        }

        res.status(201).json({ success: bookedSlot.affectedRows > 0, review: bookedSlot.insertId, latestUpdate: latestResult.affectedRows, userslot: user.affectedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
    }
};

const reviewshow = async (req, res) => {
    try {
        const [slots] = await slotsdata.execute('SELECT * FROM reviews');

        if (slots.length === 0) {
            res.status(404).json({ success: false, message: 'No slots found' });
        }

        res.status(200).json({ success: true, slots });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
    }
};

const deletereview = async (req, res) => {
    try {
        const productId = req.params.id;

        const [result] = await slotsdata.execute('DELETE FROM reviews WHERE id = ?', [productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "reviews not found" });
        }

        res.status(200).json({ success: true, message: "reviews deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

//reviews End///



// New cODE sTART hERE
const slotCreate = async (req, res) => {
    try {
        const { slots } = req.body;
        // console.log(req.body)
        // return res.send(req.body)
        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({ success: false, error: 'No slots provided' });
        }

        
        // Validate each slot in the array
        for (const slot of slots) {
            const { from, to, day, teacher_id, timezone } = slot;

            // Check if any required property is missing
            if (!from || !to || !day || !teacher_id || !timezone) {
                return res.status(400).json({ error: 'All fields are required for each slot.' });
            }
        }

        const insertPromises = slots.map(async (slot) => {
            const { from, to, day, teacher_id, timezone } = slot;

            // Your database query to insert a single slot into the database
            const query = 'INSERT INTO users_slots (from_time, to_time, day, teacher_id, timezone) VALUES (?, ?, ?, ?, ?)';
            const result = await db.query(query, [from, to, day, teacher_id, timezone]);

            // Assuming the insertId property contains the ID of the newly inserted record
            return result[0].insertId;
        });

        const slotIds = await Promise.all(insertPromises);

        res.status(201).json({ success: true, slotIds });
    } catch (error) {
        console.error('Error creating slots:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};


const getAllSlot = async (req, res) => {
    const { id, day } = req.params;
    const { timezone } = req.body;
    
    let values = []
    let query = 'SELECT * FROM users_slots WHERE teacher_id = ?';
    values.push(id)
    // Check if the day parameter is provided
    if (day) {
        query += ' AND day = ?';
        values.push(day);
    }

    const [allSlot] = await UserSlots.execute(query, values);
    if (allSlot.length === 0) {
        res.status(404).json({ error: 'Slot not found.' });
        return;
    }
    if(timezone){
        for (let index = 0; index < allSlot.length; index++) {
            const element = allSlot[index];
            const currentDate = new Date();
            // Extract year, month, and day components
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month starts from 0, so add 1
            const day = String(currentDate.getDate()).padStart(2, '0');
    
            // Format the date as Y-m-d
            const formattedDate = `${year}-${month}-${day} ${element.from_time}`;
    
            console.log("from_time",formattedDate); // Output: YYYY-MM-DD
            let time = changeTimeZone(formattedDate,timezone)
            allSlot[index].from_time = time;
            
            
            const formattedDate1 = `${year}-${month}-${day} ${element.to_time}`;
            console.log("to_time",formattedDate1); // Output: YYYY-MM-DD
            let time1 = changeTimeZone(formattedDate1,timezone)
            allSlot[index].to_time = time1
            console.log("time ================.>>",time1)
        }
    }

    res.status(200).json({ status: true, slots:allSlot });    
}
const getSlotById = async (req, res) => {
    const { id,day } = req.params;
    const { timezone } = req.body;
    
    let values = []
    let query = 'SELECT * FROM users_slots WHERE id = ?';
    values.push(id)
    // Check if the day parameter is provided
    if (day) {
        query += ' AND day = ?';
        values.push(day);
    }

    const [allSlot] = await UserSlots.execute(query, values);
    if (allSlot.length === 0) {
        res.status(404).json({ error: 'Slot not found.' });
        return;
    }
    if(timezone){
        for (let index = 0; index < allSlot.length; index++) {
            const element = allSlot[index];
            const currentDate = new Date();
            // Extract year, month, and day components
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month starts from 0, so add 1
            const day = String(currentDate.getDate()).padStart(2, '0');
    
            // Format the date as Y-m-d
            const formattedDate = `${year}-${month}-${day} ${element.from_time}`;
    
            console.log("from_time",formattedDate); // Output: YYYY-MM-DD
            let time = changeTimeZone(formattedDate,timezone)
            allSlot[index].from_time = time
            
            const formattedDate1 = `${year}-${month}-${day} ${element.to_time}`;
            console.log("to_time",formattedDate1); // Output: YYYY-MM-DD
            let time1 = changeTimeZone(formattedDate1,timezone)
            allSlot[index].to_time = time1
            console.log("time ================.>>",time1)
        }
    }

    res.status(200).json({ status: true, slots:allSlot });    
}
// Sample exchange rates data (replace with real data)
function changeTimeZone(date,timeZone){
    // Current date and time
    const currentDate = new Date(date);

    // Original timezone
    // console.log('Original date and time:', currentDate.toLocaleString());

    // Desired timezone
    const targetTimeZone = timeZone;

    // Format the date and time in the desired timezone
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimeZone,
    //   year: 'numeric',
    //   month: '2-digit',
    //   day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(currentDate);

    // console.log('Date and time in', targetTimeZone, ':', formattedDate);
    return formattedDate;
}
const updateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { slots } = req.body;
        // return res.send(req.body)
        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({ success: false, error: 'No slots provided' });
        }

        // Validate each slot in the array
        for (const slot of slots) {
            const { id, from, to, day, teacher_id, timezone } = slot;

            // Check if any required property is missing
            if (!from || !to || !day || !teacher_id || !timezone || !id) {
                return res.status(400).json({ error: 'All fields are required for each slot.' });
            }
        }

        const updatePromises = slots.map(async (slot) => {
            const { id, from, to, day, teacher_id, timezone } = slot;
            // Your database query to update a single slot in the database
            const query = 'UPDATE users_slots SET from_time = ?, to_time = ?, day = ?, teacher_id = ?, timezone = ? WHERE id = ?';
            const result = await db.query(query, [from, to, day, teacher_id, timezone, id]);
            // Assuming the affectedRows property indicates the number of rows updated
            return result[0].affectedRows > 0; // Return true if at least one row was updated
        });
        
        // Wait for all update promises to resolve
        const updatedResults = await Promise.all(updatePromises);
        
        // Check if all updates were successful
        const allUpdated = updatedResults.every(result => result);
        
        if (allUpdated) {
            return res.status(200).json({ success: true, message: 'Slots updated successfully.' });
        } else {
            return res.status(500).json({ error: 'Some slots could not be updated.' });
        }
    } catch (error) {
        console.error('Error updating slot:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


const bookSlotSchema = Joi.object({
    user_id: Joi.number().required(),
    teacher_id: Joi.number().required(),
    slot_id: Joi.number().required(),
    user_timezone: Joi.string().required(),
    book_date: Joi.date().iso().required(),
    transaction_id:Joi.string(),
    transaction_status:Joi.string(),
});

const bookSlot = async (req, res) => {
    try {
        // return res.send(req.body)
        const { error } = bookSlotSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Process valid request
        const { user_id, teacher_id, slot_id, user_timezone, book_date, transaction_id, transaction_status } = req.body;

        const existingBookingQuery = 'SELECT * FROM booking WHERE user_id = ? AND slot_id = ? AND book_date = ?';
        const existingBookingResult = await db.query(existingBookingQuery, [user_id, slot_id, book_date]);
        console.log(existingBookingResult[0])
        if (existingBookingResult[0].length > 0) {
            return res.status(400).json({ error: 'User already has a booking for this slot and date.' });
        }
        
        const query = 'INSERT INTO booking (user_id, teacher_id, slot_id, user_timezone, book_date, transaction_id, transaction_status) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const result = await db.query(query, [user_id, teacher_id, slot_id, user_timezone, book_date, transaction_id, transaction_status]);

            // Assuming the insertId property contains the ID of the newly inserted record
        let lastId  = result[0].insertId;

        res.status(200).json({ success: true, message: 'Slot booked successfully.',bookId:lastId });
    } catch (error) {
        console.error('Error booking slot:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const deleteSlot = async (req, res) => {
    try {
        const slotId = req.params.id;
        if(slotId == '' || slotId == undefined){
            return res.status(400).json({ success: false, message: 'slotId is required' });
          }
          
        const [result] = await slotsdata.execute('DELETE FROM users_slots WHERE id = ?', [slotId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Slot not found" });
        }

        res.status(200).json({ success: true, message: "Slot deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    slotbook,
    slotshow,
    reviewcount,
    reviewshow,
    deleteslot,
    deletereview,
    slotCreate,
    updateSlot,
    getSlotById,
    getAllSlot,
    bookSlot,
    deleteSlot
};   