const router = require('express').Router();
const { validateEmail, validateName } = require('../helpers/validation');
const errorCodes = require('../helpers/errorCodes');
const { User } = require('../models/User');
const { CourseModel } = require('../models/Courses');
const requireLogin = require('../middlewares/requireLogin');

router.delete('/delete/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      throw errorCodes['E0004'];
    } else {
      res.status(200);
      res.send(deletedUser)
    }

	} catch (error) {
		if (error === errorCodes['E0004']) {
      // Handle "user not found" error response here
      res.status(204);
    } else {
      res.status(400);
    }
    
    console.log(error);
    res.send({
			error: error
		});
	}
});

// Update User with dynamic fields
router.patch('/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body; // Fields to be updated dynamically

    const validFields = await validateFields(updateFields);

    if (validFields) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true } // This ensures that the updated user document is returned
      );

      if (!updatedUser) {
        throw errorCodes['E0004'];
      }

      res.status(200).send(updatedUser);
    }

  } catch (error) {
    if (error === errorCodes['E0004']) {
      // Handle "user not found" error response here
      res.status(204);
    } else {
      res.status(400);
    }
    
    console.log(error);
    res.send({
			error: error
		});
  }
});

async function validateFields(fields) {
  const fieldEntries = Object.entries(fields);

  for (const [fieldName, fieldValue] of fieldEntries) {
    if (fieldName === 'email') {
      const emailValid = await validateEmail(fieldValue);
      if (!emailValid) {
        return false;
      }
    } else if (fieldName === 'firstName' || fieldName === 'lastName') {
      const nameValid = await validateName(fieldValue);
      if (!nameValid) {
        return false;
      }
    }
  }
  return true;
}

/** SUBSCRIPTIONS **/

// Get users subscriptions
router.get('/:id/subscriptions', async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by _id and select the 'subscriptions' field
    const user = await User.findById(userId).select('subscriptions');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscribedCourses = user.subscriptions;

    // Find courses based on the subscribed course IDs
    const list = await CourseModel.find({ '_id': { $in: subscribedCourses } });

    res.send(list);

  } catch (error) {
    console.error(("Error getting users subscribed courses, message: " + error));
    res.status(500).json({ message: 'Server error' });
  }
});



// Checks if user is subscribed to a specific course
router.get('', async (req, res) => {
	try {
	  const { user_id, course_id } = req.query;
  
	  // Check if the course_id exists in the user's subscriptions array
	  const userTest = await User.findById(user_id);
  
	  if (userTest.subscriptions.includes(course_id)) {
		// User is subscribed to the course
		res.send("true");
	  } else {
		// User is not subscribed to the course
		res.send("false");
	  }
	} catch (error) {
	  console.error(("Error checking if user is subscribed to course, message: " + error));
	  res.status(500).json({ message: 'Server error' });
	}
  });


  
  module.exports = router;