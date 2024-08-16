const bcrypt = require('bcryptjs');
    const path = require('path');
    const fs = require('fs');
    const mysqlConnection = require('../models/latest');
    const db = require('../models/user');


    
    const createLatest = async (req, res) => {
        try {

            if (!req.files || (!req.files.image && !req.files.video) ) {
                return res.status(400).json({ success: false, message: 'Image and Video must be uploaded' });
            }
            
            
            // Extracting file names from req.files
            req.body.image = req.files.image[0].filename;
            if(req.files.video){
                req.body.video = req.files.video[0].filename;
            }
            
            if (req.files && req.files['certificateuploadPhoto[]'] && req.files['certificateuploadPhoto[]'].length > 0) {
                if(req.files['certificateuploadPhoto[]'][0].filename){
                    let certificateData = JSON.parse(req.body.certificate)
                    let i = 0;
                    for(item of certificateData){
                        certificateData[i]['uploadPhoto'] = req.files['certificateuploadPhoto[]'][i].filename
                        i++
                    }
                    req.body.certificate = JSON.stringify(certificateData);
                }
            }else{
                // return res.send('iamhere')
            }

            if (req.files && req.files['contactsEducation[]'] && req.files['contactsEducation[]'].length > 0) {
                if(req.files['contactsEducation[]'][0].filename){
                    let EducationData = JSON.parse(req.body.Education)
                    let i = 0;
                    for(item of EducationData){
                        EducationData[i]['uploadDiploma'] = req.files['contactsEducation[]'][i].filename
                        i++
                    }
                    req.body.Education = JSON.stringify(EducationData);
                }
            }else{
                // return res.send('iamhere')
            }

            
            const { name, lastname,teachemail, teachpassword, mobileNumber, description, price, videointro_url, ytvideointro_url, age18plus, parentContact, rating, level, categories, duration, country, speak, specialties, image, video, speaker, Supertutors, professionaltutors, Education, certificate, Schedule, parents_email, parents_name, gender} = req.body;
            
            
            // Parsing certificate, Education, and Schedule to convert them into JSON objects
            let parsedCertificate, parsedEducation, parsedSchedule;

            try {
                parsedCertificate = JSON.parse(certificate);
            } catch (error) {
                console.error('Error parsing certificate:', error);
                return res.status(400).json({ success: false, message: 'Error parsing certificate JSON' });
            }

            try {
                parsedEducation = JSON.parse(Education);
            } catch (error) {
                console.error('Error parsing Education:', error);
                console.log(Education);
                return res.status(400).json({ success: false, message: 'Error parsing Education JSON' });
            }

            try {
                parsedSchedule = JSON.parse(Schedule);
            } catch (error) {
                console.error('Error parsing Schedule:', error);
                return res.status(400).json({ success: false, message: 'Error parsing Schedule JSON' });
            };
            const speakertrue = req.body.speaker === 'true';
            const Supertutorstrue = req.body.Supertutors === 'true';
            const professionaltutorstrue = req.body.professionaltutors === 'true';
            
            let timeZone = ''
            if(parsedSchedule.timeZone){
               timeZone = parsedSchedule.timeZone
            }
            
            let techear_id = '';
            if(teachemail && teachpassword){
                const hashedPassword = await bcrypt.hash(teachpassword, 10);
                const userImage = req.body.image
                const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [teachemail]);
                if (existingUser.length > 0) {
                    return res.status(400).json({ success: false, message: 'Email already exists' });
                }

                const result = await db.query('INSERT INTO users (email, password, firstname, lastname, mobileNumber, code, role, profileImage, timezone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [teachemail, hashedPassword, name, lastname, mobileNumber, "", "teacher", userImage, timeZone]);
                techear_id = result[0].insertId;
            }else{
                return res.status(400).json({ success: false, message: 'Teacher Email & Password is required' });
            }
            console.log("techear_id ==>",techear_id)

            let slots = [];
            if(parsedSchedule){
                for (let s = 0; s < parsedSchedule.slots.length; s++) {
                    const element = parsedSchedule.slots[s];
                    let slot = [];
                    slot.from = element.from
                    slot.to = element.to
                    slot.day = element.day
                    slot.teacher_id = techear_id
                    slot.timezone = parsedSchedule.timeZone
                    slots.push(slot)
                }

                try {
                    const query = 'INSERT INTO users_slots (from_time, to_time, day, teacher_id, timezone) VALUES ?';
                    console.log(slots); // Make sure slots is an array of arrays
                    const values = slots.map(slot => [slot.from, slot.to, slot.day, slot.teacher_id, slot.timezone]);
                    const results = await db.query(query, [values]);
                    console.log("SLOTS INSERT CODE",results)
                } finally {
                    console.log(slots);
                }
            }
            
            const connection = await mysqlConnection.getConnection();
            const query = 'INSERT INTO latest (name, lastname,techearid, mobileNumber, description, price, videointro_url, ytvideointro_url, age18plus, parentContact, rating, level, categories, duration, country, speak, specialties, image, video, speaker, Supertutors, professionaltutors, Education, certificate, Schedule, parents_email, parents_name, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?, ?,?,?)';
            
            try {
                const results = await mysqlConnection.query(query, [name, lastname,techear_id, mobileNumber, description, price, videointro_url, ytvideointro_url, age18plus, parentContact, rating, level, categories, duration, country, speak, specialties, image, video, speakertrue, Supertutorstrue, professionaltutorstrue, JSON.stringify(parsedEducation), JSON.stringify(parsedCertificate), JSON.stringify(parsedSchedule), parents_email, parents_name, gender]);
                
                res.status(201).json({ success: true, product: results[0].insertId});
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
        }
    };

    const updateLatest = async (req, res) => {
        try {
            const productId = req.params.id;
            const {
                name, description, price, firstprice,
                rating, level, categories, techearid,
                duration, country, speak,
                specialties, speaker, Supertutors,
                professionaltutors, certificate,
                Education, Schedule, lastname,
                mobileNumber
            } = req.body;

            if (!name || !description ||!techearid || !price || !firstprice || !rating || !level || !categories || !duration || !country || !speak || !specialties || !speaker || !Supertutors || !professionaltutors || !lastname || !mobileNumber) {
                console.error('Missing required fields:', req.body);
                return res.status(400).json({ success: false, message: 'All fields are required for the update' });
            }

            const connection = await mysqlConnection.getConnection();

            try {
                let imageFileName = null;
                let videoFileName = null;

                if (req.files) {
                    if (req.files.image) {
                        imageFileName = req.files.image[0].filename;

                        const [existingProduct] = await connection.execute('SELECT image FROM latest WHERE id = ?', [productId]);
                        if (existingProduct.length > 0 && existingProduct[0].image) {
                            const imagePath = path.join('uploads', existingProduct[0].image);
                            if (fs.existsSync(imagePath)) {
                                fs.unlinkSync(imagePath);
                            }
                        }
                    }

                    if (req.files.video) {
                        videoFileName = req.files.video[0].filename;

                        const [existingProduct] = await connection.execute('SELECT video FROM latest WHERE id = ?', [productId]);
                        if (existingProduct.length > 0 && existingProduct[0].video) {
                            const videoPath = path.join('uploads', existingProduct[0].video);
                            if (fs.existsSync(videoPath)) {
                                fs.unlinkSync(videoPath);
                            }
                        }
                    }
                }
                
                
                const speakertrue = req.body.speaker === 'true';
                const Supertutorstrue = req.body.Supertutors === 'true';
                const professionaltutorstrue = req.body.professionaltutors === 'true';
                // Parsing certificate, Education, and Schedule strings into JSON objects
                const parsedCertificate = JSON.parse(certificate);
                const parsedEducation = JSON.parse(Education);
                const parsedSchedule = JSON.parse(Schedule);

                const query = `
                    UPDATE latest 
                    SET 
                        name = ?,
                        description = ?,
                        price = ?,
                        techearid=?,
                        firstprice =?,
                        rating = ?,
                        level = ?,
                        categories = ?,
                        duration = ?,
                        country = ?,
                        speak = ?,
                        specialties = ?,
                        speaker = ?,
                        lastname =?,
                        mobileNumber =?,
                        Supertutors =?,
                        professionaltutors =?,
                        Education = ?,
                        certificate = ?,
                        Schedule =?,
                        ${imageFileName ? 'image = ?' : 'image = NULL'},
                        ${videoFileName ? 'video = ?' : 'video = NULL'} 
                    WHERE id = ?`;

                const values = [
                    name,
                    description,
                    price,
                    firstprice,
                    rating,
                    level,
                    techearid,
                    categories,
                    duration,
                    country,
                    speak,
                    specialties,
                    speakertrue,
                    lastname,
                    mobileNumber,
                    Supertutorstrue,
                    professionaltutorstrue,
                    JSON.stringify(parsedEducation), 
                    JSON.stringify(parsedCertificate),
                    JSON.stringify(parsedSchedule),
                    ...(imageFileName ? [imageFileName] : []),
                    ...(videoFileName ? [videoFileName] : []),
                    productId,
                ];

                const [result] = await connection.execute(query, values);

                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Product not found' });
                }

                res.status(200).json({ success: true, message: 'Product updated successfully' });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error in updateLatest:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        }
    };

    const patchSchedule = async (req, res) => {
        try {
            const productId = req.params.id;
            let { Schedule } = req.body;

            if (!Schedule) {
                return res.status(400).json({ success: false, message: 'Schedule data is required for update' });
            }

            // Check if Schedule is already a JSON object
            if (typeof Schedule === 'object') {
                Schedule = JSON.stringify(Schedule);
            } else {
                try {
                    JSON.parse(Schedule); // Test if Schedule is a valid JSON string
                } catch (error) {
                    return res.status(400).json({ success: false, message: 'Invalid JSON format for Schedule data' });
                }
            }

            const connection = await mysqlConnection.getConnection();

            try {
                const query = `
                    UPDATE latest 
                    SET Schedule = ?
                    WHERE id = ?`;

                const [result] = await connection.execute(query, [Schedule, productId]);

                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Product not found' });
                }

                res.status(200).json({ success: true, message: 'Schedule updated successfully' });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error in patchLatest:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        }
    };


    const patchEducation = async (req, res) => {
        try {
            const productId = req.params.id;
            let { Education } = req.body;

            if (!Education) {
                return res.status(400).json({ success: false, message: 'Education data is required for update' });
            }

            // Check if Schedule is already a JSON object
            if (typeof Education === 'object') {
                Education = JSON.stringify(Education);
            } else {
                try {
                    JSON.parse(Education); // Test if Schedule is a valid JSON string
                } catch (error) {
                    return res.status(400).json({ success: false, message: 'Invalid JSON format for Education data' });
                }
            }

            const connection = await mysqlConnection.getConnection();

            try {
                const query = `
                    UPDATE latest 
                    SET Education = ?
                    WHERE id = ?`;

                const [result] = await connection.execute(query, [Education, productId]);

                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Product not found' });
                }

                res.status(200).json({ success: true, message: 'Education updated successfully' });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error in patchLatest:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        }
    };
    const patchcertificate = async (req, res) => {
        try {
            const productId = req.params.id;
            let { certificate } = req.body;

            if (!certificate) {
                return res.status(400).json({ success: false, message: 'certificate data is required for update' });
            }

            // Check if Schedule is already a JSON object
            if (typeof certificate === 'object') {
                certificate = JSON.stringify(certificate);
            } else {
                try {
                    JSON.parse(certificate); // Test if Schedule is a valid JSON string
                } catch (error) {
                    return res.status(400).json({ success: false, message: 'Invalid JSON format for certificate data' });
                }
            }

            const connection = await mysqlConnection.getConnection();

            try {
                const query = `
                    UPDATE latest 
                    SET certificate = ?
                    WHERE id = ?`;

                const [result] = await connection.execute(query, [certificate, productId]);

                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Product not found' });
                }

                res.status(200).json({ success: true, message: 'certificate updated successfully' });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error in patchLatest:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        }
    };
    const patchspeak = async (req, res) => {
        try {
            const productId = req.params.id;
            let { speak } = req.body;

            if (!speak) {
                return res.status(400).json({ success: false, message: 'speak data is required for update' });
            }

            // Check if Schedule is already a JSON object
            if (typeof speak === 'object') {
                speak = JSON.stringify(speak);
            } else {
                try {
                    JSON.parse(speak); // Test if Schedule is a valid JSON string
                } catch (error) {
                    return res.status(400).json({ success: false, message: 'Invalid JSON format for speak data' });
                }
            }

            const connection = await mysqlConnection.getConnection();

            try {
                const query = `
                    UPDATE latest 
                    SET speak = ?
                    WHERE id = ?`;

                const [result] = await connection.execute(query, [speak, productId]);

                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Product not found' });
                }

                res.status(200).json({ success: true, message: 'speak updated successfully' });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error in patchLatest:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        }
    };


    const verifired = async (req, res) => {
        try {
            const productId = req.params.id;

            const connection = await mysqlConnection.getConnection();

            try {
                // Fetch the current value of 'verified' before updating
                const [currentResult] = await connection.execute('SELECT verified FROM latest WHERE id = ?', [productId]);

                // Toggle the 'verified' value
                const newVerificationStatus = !currentResult[0].verified;

                // Update the 'verified' field
                const [updateResult] = await connection.execute('UPDATE latest SET verified = ? WHERE id = ?', [newVerificationStatus, productId]);

                if (updateResult.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Product not found' });
                }

                res.status(200).json({ success: true, message: 'Product verification status updated successfully', verified: newVerificationStatus });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error in verifyProduct:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        }
    };

    const getAllLatest = async (req, res) => {
        try {
            const [products] = await mysqlConnection.execute('SELECT * FROM latest');

            if (products.length === 0) {
                res.status(404).json({ success: false, message: 'Not found' });
            }

            res.status(200).json({ success: true, products });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    };
    const latestFilter = async (req, res) => {
        try {
            const { techearid } = req.params;
            const { verified } = req.query;

            let query = 'SELECT * FROM latest WHERE techearid = ?';
            const values = [techearid];

            if (verified !== undefined) {
                query += ' AND verified = ?';
                values.push(verified);
            }

            const [products] = await mysqlConnection.execute(query, values);

            if (products.length === 0) {
                return res.status(404).json({ success: false, message: 'No products found for the given teacher ID' });
            }

            res.status(200).json({ success: true, products });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    };


    const getLatestById = async (req, res) => {
        try {
            const productId = req.params.id;
            console.log('Requested product ID:', productId);

            const [productRows] = await mysqlConnection.execute('SELECT * FROM latest WHERE techearid = ?', [productId]);
            console.log('Retrieved product rows:', productRows);

            if (productRows.length === 0) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            const product = productRows[0]; // Assuming you expect only one result
            product.Education = JSON.parse(product.Education)
            product.Schedule = JSON.parse(product.Schedule)
            product.certificate = JSON.parse(product.certificate)
            console.log('Retrieved product:', product);

            res.status(200).json({ success: true, product });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };

    const deleteLatest = async (req, res) => {
        try {
            const productId = req.params.id;

            const [result] = await mysqlConnection.execute('DELETE FROM latest WHERE id = ?', [productId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            res.status(200).json({ success: true, message: "Latest deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };


    const addToWishlist = async (req, res) => {
        const { userId, productId } = req.params;
    
        try {
            // Check if the user and product exist
            const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
            const [product] = await mysqlConnection.query('SELECT * FROM latest WHERE id = ?', [productId]);
    
            if (!user || user.length === 0 || !product || product.length === 0) {
                return res.status(404).json({ success: false, message: 'User or product not found' });
            }
    
            // Check if the product is already in the user's wishlist
            const [existingWishlistItem] = await db.query('SELECT * FROM wishlists WHERE userId = ? AND productId = ?', [userId, productId]);
    
            if (existingWishlistItem.length > 0) {
                return res.status(400).json({ success: false, message: 'Product already in the wishlist' });
            }
    
            // Add the product to the wishlist
            await db.query('INSERT INTO wishlists (userId, productId) VALUES (?, ?)', [userId, productId]);
    
            // Retrieve the added product details
            const [addedProduct] = await db.query('SELECT * FROM latest WHERE id = ?', [productId]);

            res.status(201).json({ success: true, message: 'Product added to the wishlist', products: [addedProduct] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };


    const getWishlistDataForUser = async (req, res) => {
        const { userId } = req.params;

        try {
            // Check if the user exists
            const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

            if (!user || user.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Retrieve wishlist items for the user with product details
            const wishlistItems = await db.query(`
                SELECT w.*, l.*
                FROM wishlists w
                JOIN latest l ON w.productId = l.id
                WHERE w.userId = ?
            `, [userId]);

            // Parse buffer data into JSON format
            const parsedWishlistItems = wishlistItems[0].map(item => {
                const parsedItem = {};
                for (const key in item) {
                    if (Buffer.isBuffer(item[key])) {
                        // Convert buffer to string assuming utf8 encoding
                        parsedItem[key] = item[key].toString('utf8');
                    } else {
                        parsedItem[key] = item[key];
                    }
                }
                return parsedItem;
            });

            res.status(200).json({ success: true, wishlistItems: parsedWishlistItems });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };


    const getWishlistDatadelete = async (req, res) => {
        const { userId, productId } = req.params;

        try {
            // Check if the user exists
            const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

            if (!user || user.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Check if the product exists
            const [product] = await db.query('SELECT * FROM latest WHERE id = ?', [productId]);

            if (!product || product.length === 0) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            // Check if the product is in the user's wishlist
            const [existingWishlistItem] = await db.query('SELECT * FROM wishlists WHERE userId = ? AND productId = ?', [userId, productId]);

            if (existingWishlistItem.length === 0) {
                return res.status(404).json({ success: false, message: 'Product not found in the wishlist' });
            }

            // Delete the product from the wishlist
            await db.query('DELETE FROM wishlists WHERE userId = ? AND productId = ?', [userId, productId]);

            res.status(200).json({ success: true, message: 'Product removed from the wishlist' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };
    
    
    
    const updateLatestByPatch = async (req, res) => {
        try {
            const productId = req.params.id;
            let {
                name, description, price, firstprice,
                rating, level, categories, techearid,
                duration, country, speak,
                specialties, speaker, Supertutors,
                professionaltutors, certificate,
                Education, Schedule, lastname,
                mobileNumber,ytvideointro_url,videointro_url,delete_certificate_index
            } = req.body;

            // if (!name || !description ||!techearid || !price || !firstprice || !rating || !level || !categories || !duration || !country || !speak || !specialties || !speaker || !Supertutors || !professionaltutors || !lastname || !mobileNumber) {
            //     console.error('Missing required fields:', req.body);
            //     return res.status(400).json({ success: false, message: 'All fields are required for the update' });
            // }
            // return res.send(req.files)
            const connection = await mysqlConnection.getConnection();

            try {
                let imageFileName = null;
                let videoFileName = null;

                if (req.files) {
                    if (req.files.image) {
                        imageFileName = req.files.image[0].filename;

                        const [existingProduct] = await connection.execute('SELECT image FROM latest WHERE id = ?', [productId]);
                        if (existingProduct.length > 0 && existingProduct[0].image) {
                            const imagePath = path.join('uploads', existingProduct[0].image);
                            if (fs.existsSync(imagePath)) {
                                fs.unlinkSync(imagePath);
                            }
                        }
                    }

                    if (req.files.video) {
                        videoFileName = req.files.video[0].filename;

                        const [existingProduct] = await connection.execute('SELECT video FROM latest WHERE id = ?', [productId]);
                        if (existingProduct.length > 0 && existingProduct[0].video) {
                            const videoPath = path.join('uploads', existingProduct[0].video);
                            if (fs.existsSync(videoPath)) {
                                fs.unlinkSync(videoPath);
                            }
                        }
                    }
                    
                    if (req.files && req.files['certificateuploadPhoto[]'] && req.files['certificateuploadPhoto[]'].length > 0) {
                        if(req.files['certificateuploadPhoto[]'][0].filename){
                            let certificateData = JSON.parse(req.body.certificate)
                            let i = 0;
                            for(item of certificateData){
                                certificateData[i]['uploadPhoto'] = req.files['certificateuploadPhoto[]'][i].filename
                                i++
                            }
                            // return res.send(certificateData)
                            certificate = JSON.stringify(certificateData);
                        }else{
                            // return res.send('iamhersde')
                        }
                    }else{
                        // return res.send('iamhere')
                    }
                    if (req.files && req.files['contactsEducation[]'] && req.files['contactsEducation[]'].length > 0) {
                        if(req.files['contactsEducation[]'][0].filename){
                            let EducationData = JSON.parse(req.body.Education)
                            let i = 0;
                            for(item of EducationData){
                                EducationData[i]['uploadDiploma'] = req.files['contactsEducation[]'][i].filename
                                i++
                            }
                            Education = JSON.stringify(EducationData);
                        }
                    }else{
                        // return res.send('iamhere')
                    }
                }else{
                    // return res.send('iamhere')
                }
                const speakertrue = req.body.speaker === 'true';
                const Supertutorstrue = req.body.Supertutors === 'true';
                const professionaltutorstrue = req.body.professionaltutors === 'true';

                // Parsing certificate, Education, and Schedule strings into JSON objects
                let parsedCertificate = ''; // Initialize parsedCertificate with an empty string
                let parsedSchedule = ''; 
                let parsedEducation = ''; 

                if (certificate || delete_certificate_index) {
                    try {
                        const [certificate_old] = await db.query('SELECT * FROM latest WHERE id = ?', [productId]);
                        let oldc = JSON.parse(certificate_old[0].certificate)
                        oldc.push(...parsedCertificate)
                        
                        if(delete_certificate_index == 'undefined' || delete_certificate_index == ''){
                            parsedCertificate = JSON.parse(certificate); // Parse certificate if it's defined
                            parsedCertificate = oldc
                        }else{
                            delete oldc[delete_certificate_index];
                            parsedCertificate = oldc
                        }
                            
                        return res.send({delete_certificate_index:oldc})  
                    } catch (error) {
                        console.error('Error parsing certificate:', error); // Log any parsing errors
                        return res.status(400).json({ success: false, message: 'Error parsing certificate: '+error });
                    }
                }
                
                if (Education) {
                    try {
                        parsedEducation = JSON.parse(Education);
                    } catch (error) {
                        console.error('Error parsing certificate:', error); // Log any parsing errors
                        return res.status(400).json({ success: false, message: 'Error parsing Education: '+error });
                    }
                }
                
                if (Schedule) {
                    try {
                        parsedSchedule = JSON.parse(Schedule);
                    } catch (error) {
                        console.error('Error parsing certificate:', error); // Log any parsing errors
                        return res.status(400).json({ success: false, message: 'Error parsing Schedule: '+error });
                    }
                }
                
                
                let query = `UPDATE latest SET `;
                let values1 = []
                if(name){
                    query += ` name = ?, `;
                    values1.push(name)
                }

                if(description){
                    query += ` description = ?, `;
                    values1.push(description)
                }

                if(price){
                    query += ` price = ?, `;
                    values1.push(price)
                }
                if(techearid){
                    query += ` techearid = ?, `;
                    values1.push(techearid)
                }
                if(firstprice){
                    query += ` firstprice = ?, `;
                    values1.push(firstprice)
                }
                if(categories){
                    query += ` categories = ?, `;
                    values1.push(categories)
                }
                if(duration){
                    query += ` duration = ?, `;
                    values1.push(duration)
                }
                if(country){
                    query += ` country = ?, `;
                    values1.push(country)
                }
                if(speak){
                    query += ` speak = ?, `;
                    values1.push(speak)
                }
                if(specialties){
                    query += ` specialties = ?, `;
                    values1.push(specialties)
                }
                if(speakertrue){
                    query += ` speaker = ?, `;
                    values1.push(speaker)
                }
                if(lastname){
                    query += ` lastname = ?, `;
                    values1.push(lastname)
                }
                if(mobileNumber){
                    query += ` mobileNumber = ?, `;
                    values1.push(mobileNumber)
                }
                if(Supertutorstrue){
                    query += ` Supertutors = ?, `;
                    values1.push(Supertutors)
                }
                if(professionaltutorstrue){
                    query += ` professionaltutors = ?, `;
                    values1.push(professionaltutors)
                }
                if(parsedEducation){
                    query += ` Education = ?, `;
                    values1.push(JSON.stringify(parsedEducation))
                }
                if(parsedCertificate){
                    query += ` certificate = ?, `;
                    values1.push(JSON.stringify(parsedCertificate))
                }
                if(parsedSchedule){
                    query += ` Schedule = ?, `;
                    values1.push(JSON.stringify(parsedSchedule))
                }
                if(imageFileName){
                    query += ` image = ?, `;
                    values1.push(imageFileName)
                }
                if(videoFileName){
                    query += ` video = ?, `;
                    values1.push(videoFileName)
                }
                if(videointro_url){
                    query += ` videointro_url = ?, `;
                    values1.push(videointro_url)
                }
                if(ytvideointro_url){
                    query += ` ytvideointro_url = ?, `;
                    values1.push(ytvideointro_url)
                }

                query = query.slice(0, -2);

                query += ` WHERE id = ?`;
                values1.push(productId);

                const [result1] = await connection.execute(query, values1);
                console.log(query,values1)
                console.log('Result ==>',result1)
                
                if (result1.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Product not found' });
                }

                res.status(200).json({ success: true, message: 'Product updated successfully' });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error in updateLatest:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        }
    };


    module.exports = {
        createLatest,
        updateLatest,
        getAllLatest,
        getLatestById,
        deleteLatest,
        verifired,
        patchSchedule,
        patchEducation,
        patchcertificate,
        latestFilter,
        patchspeak,
        addToWishlist,
        getWishlistDataForUser,
        getWishlistDatadelete,
        updateLatestByPatch
    };
