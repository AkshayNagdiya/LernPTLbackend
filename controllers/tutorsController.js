const tutorsdata = require('../models/tutors');
const mysqlConnection = require('../models/latest');

const tutorscreate = async (req, res) => {
    try {
        const { tutors } = req.body;
        const existingTutor = await tutorsdata.query('SELECT * FROM tutor WHERE tutors = ?', [tutors]);
        if (existingTutor[0].length > 0) {
            res.status(200).json({ success: true, message: 'Tutor already exists'});
            return;
        }

        // Insert new tutor if it doesn't exist
        const insertResult = await tutorsdata.query('INSERT INTO tutor (tutors) VALUES (?)', [tutors]);

        res.status(201).json({ success: true, message: 'Tutor created successfully' });
    } catch (error) {
        console.error('Error creating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};



const tutorsshow = async (req, res) => {
    try {
        const result = await tutorsdata.query('SELECT * FROM tutor');
        res.json({ success: true, tutors: result[0] });
    } catch (error) {
        console.error('Error fetching tutors:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}



const tutorsdelete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await tutorsdata.query('DELETE FROM tutor WHERE id = ?', [id]);

        if (result[0].affectedRows > 0) {
            // Deletion successful
            res.json({ success: true, message: 'Tutor deleted successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'Tutor not found' });
        }
    } catch (error) {
        console.error('Error deleting tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}


const updatestutors = async (req, res) => {
    try {
        const { id } = req.params;
        const { tutors } = req.body;
        const result = await tutorsdata.query('UPDATE tutor SET tutors = ? WHERE id = ?', [tutors, id]);

        if (result[0].affectedRows > 0) {
            // Update successful
            res.json({ success: true, message: 'Tutor updated successfully' });
        } else {
            // No rows were affected, meaning no tutor was found with the given id
            res.status(404).json({ success: false, error: 'Tutor not found' });
        }
    } catch (error) {
        console.error('Error updating tutor:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
const tutorsshowbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await tutorsdata.query('SELECT * FROM tutor WHERE id = ?', [id]);

        if (result[0].length > 0) {
            // Tutor found
            res.json({ success: true, tutor: result[0][0] });
        } else {
            // No tutor found with the given id
            res.status(404).json({ success: false, error: 'Tutor not found' });
        }
    } catch (error) {
        console.error('Error fetching tutor by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


////count///
const tutorsshowcount = async (req, res) => {
    try {
        // Fetch tutors from the tutor table
        const tutorResult = await tutorsdata.query('SELECT * FROM tutor');
        const tutors = tutorResult[0];

        // Fetch data from the latest table
        const [products] = await mysqlConnection.execute('SELECT * FROM latest WHERE verified = 1');

        // Count particular categories dynamically
        const categoryCounts = {};
        products.forEach(product => {
            const { categories } = product;
            if (categories) {
                categories.split(',').forEach(category => {
                    const categoryName = category.trim(); // Remove spaces
                    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
                });
            }
        });

        // Merge tutors data with category counts
        const tutorsWithCounts = tutors.map(tutor => {
            return {
                id: tutor.id,
                tutors: tutor.tutors,
                Counts: categoryCounts[tutor.tutors] || 0
            };
        });

        res.status(200).json({ success: true, tutors: tutorsWithCounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


const allCategoriesCount = async (req, res) => {
    try {
      const [products] = await mysqlConnection.execute('SELECT * FROM latest');
  
      if (products.length === 0) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
  
      // Count particular categories dynamically
      const categoryCounts = {};
      products.forEach(product => {
        const { categories } = product;
        if (categories) {
          categories.split(',').forEach(category => {
            const categoryName = category.trim().replace(/\s+/g, ''); // Remove spaces
            categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
          });
        }
      });
  
      const categoryNames = Object.keys(categoryCounts);
  
      res.status(200).json({ success: true, categoryCounts, categoryNames });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

module.exports = {
    tutorscreate,
    tutorsshow,
    tutorsdelete,
    updatestutors,
 tutorsshowbyid,
 allCategoriesCount,
 tutorsshowcount
};