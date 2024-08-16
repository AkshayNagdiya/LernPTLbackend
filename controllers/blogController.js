const blogs = require('../models/blog');

const blogcreate = async (req, res) => {
  try {
    const { title, description, dates, comments,categories } = req.body;
    const image = req.file.filename; // Assuming you are using multer to handle file uploads

    // Insert data into the 'blogs' table
    const result = await blogs.query(
      'INSERT INTO blogs (title, description, dates, comments,categories, image) VALUES (?, ?, ?, ?, ?,?)',
      [title, description, dates, comments,categories, image]
    );

    res.status(201).json({ success: true, message: 'Blog created successfully', blogId: result[0].insertId });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const blogshow = async (req, res) => {
  try {
    const contacts = await blogs.query('SELECT * FROM blogs');

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

    res.status(200).json({ success: true, blogs: parsedContacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const blogdelete = async (req, res) => {
  try {
    const blogId = req.params.id;

    const [result] = await blogs.execute('DELETE FROM blogs WHERE id = ?', [blogId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "blog not found" });
    }

    res.status(200).json({ success: true, message: "blogs deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const updatesblog = async (req, res) => {
  const blogId = req.params.id;
  const { title, description, dates, comments,categories } = req.body;

  try {
    const [blog] = await blogs.query('SELECT * FROM blogs WHERE id = ?', [blogId]);

    if (!blog || blog.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const updatedImage = req.file ? req.file.filename : blog[0].image;

    await blogs.query(
      'UPDATE blogs SET title = ?, description = ?, dates = ?, comments = ?, image = ? WHERE id = ?',
      [title, description, dates, comments,categories, updatedImage, blogId]
    );

    res.status(200).json({ success: true, message: 'Blog updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


const blogshowbyid = async (req, res) => {
  try {
    const blogId = req.params.id;

    const [blog] = await blogs.execute('SELECT * FROM blogs WHERE id = ?', [blogId]);

    if (!blog || blog.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
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

    res.status(200).json({ success: true, blog: parsedBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


const blogcategories = async (req, res) => {
  try {
    const { blogcategories } = req.body;
    const existingTutor = await blogs.query('SELECT * FROM blogscategories WHERE blogcategories = ?', [blogcategories]);
    if (existingTutor[0].length > 0) {
        res.status(200).json({ success: true, message: 'blogcategories already exists'});
        return;
    }

    // Insert new tutor if it doesn't exist
    const insertResult = await blogs.query('INSERT INTO blogscategories (blogcategories) VALUES (?)', [blogcategories]);

    res.status(201).json({ success: true, message: 'blogcategories created successfully' });
} catch (error) {
    console.error('Error creating tutor:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
}
};

const blogshowcategory = async (req, res) => {
  try {
    const contacts = await blogs.query('SELECT * FROM blogscategories');

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

    res.status(200).json({ success: true, blogscategories: parsedContacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
module.exports = {
  blogcreate,
  blogshow,
  blogdelete,
  updatesblog,
  blogshowbyid,
  blogcategories,
  blogshowcategory
};
