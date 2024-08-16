const db = require('../models/contact');

const createContact = async (req, res) => {
  const { name, description, email, issue } = req.body;

  try {
    if (!name || !description || !email || !issue) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const result = await db.query('INSERT INTO contact (name, description, email, issue) VALUES (?, ?, ?, ?)',
      [name, description, email, issue]);

    res.status(201).json({ success: true, message: 'Contact created successfully', contactId: result[0].insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


const getAllContact = async (req, res) => {
  try {
    const contacts = await db.query('SELECT * FROM contact');

    // Parse buffer data into JSON format
    const parsedContacts = contacts[0].map(contact => {
      const parsedContact = {};
      for (const key in contact) {
        if (Buffer.isBuffer(contact[key])) {
          // Convert buffer to string assuming utf8 encoding
          parsedContact[key] = contact[key].toString('utf8');
        } else {
          parsedContact[key] = contact[key];
        }
      }
      return parsedContact;
    });

    res.status(200).json({ success: true, contacts: parsedContacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const deleteContact = async (req, res) => {
  const contactId = req.params.id;

  try {
    const result = await db.query('DELETE FROM contact WHERE id = ?', [contactId]);

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const updateContact = async (req, res) => {
  const contactId = req.params.id;
  const { name, description, email, issue } = req.body;

  try {
    const result = await db.query(
      'UPDATE contact SET name = ?, description = ?, email = ?, issue = ? WHERE id = ?',
      [name, description, email, issue, contactId]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.status(200).json({ success: true, message: 'Contact updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const contacthowbyid = async (req, res) => {
  try {
    const contactId = req.params.id;


    const [blog] = await db.execute('SELECT * FROM contact WHERE id = ?', [contactId]);

    if (!blog || blog.length === 0) {
      return res.status(404).json({ success: false, message: 'contact not found' });
    }

    // Parse buffer data into JSON format
    const parsedBlog = {};
    for (const key in blog[0]) {
      if (Buffer.isBuffer(blog[0][key])) {
        // Convert buffer to string assuming utf8 encoding
        parsedBlog[key] = blog[0][key].toString('utf8');
      } else {
        parsedBlog[key] = blog[0][key];
      }
    }

    res.status(200).json({ success: true, contact: parsedBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  createContact,
  getAllContact,
  deleteContact,
  updateContact,
  contacthowbyid,
};
