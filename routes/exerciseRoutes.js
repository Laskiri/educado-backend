const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');

//Models
const { ExerciseModel } = require('../models/Exercises');
const { SectionModel } = require('../models/Sections');
/*const {
    ContentCreatorApplication,
  } = require("../models/ContentCreatorApplication");*/ /* Not implemented yet for now */
//const requireLogin = require("../middlewares/requireLogin"); /* Not implemented yet for now */

//helpers
const { getLatestComponentFromSection } = require('../helpers/sectionHelpers');

const COMP_TYPES = {
	LECTURE: 'lecture',
	EXERCISE: 'exercise',
};

// Get all exercises
router.get('/', async (req, res) => {
	const list = await ExerciseModel.find();
	res.send(list);
});

// Get specific exercise
router.get('/:id', async (req, res) => {
	if (!req.params.id) return res.send('Missing query parameters');

	const exerciseId = req.params.id;

	let exercise = await ExerciseModel.findById(exerciseId).catch((err) => {
		throw err;
	});

	if (exercise === null)
		return res.send('No exercise found with id: ' + exerciseId);
	return res.send(exercise);
});

/**
 * Create exercise for section
 * @param {string} section_id - section id
 * @param {string} title - exercise title
 * @param {array} answers - exercise answers
 * @returns {object} - section
 */
router.put('/:section_id', async (req, res) => {
	const {title, question, answers} = req.body; 
	const section_id = req.params.section_id;
  
	const exercise = new ExerciseModel({
		title: title,
		question: question,
		answers: answers,
		parentSection: section_id,
		dateCreated: Date.now(),
		dateUpdated: Date.now(),
	});

  
	try {
		await exercise.save();
		const section = await SectionModel.findById(section_id);
		await section.components.push({
			compId: exercise._id,
			compType: COMP_TYPES.EXERCISE,
		});
		await section.save();
		const newComponent = getLatestComponentFromSection(section);

		res.status(201).send(newComponent);
		
	} catch (err) {
		res.status(400).send(err);
	}
});
  

/**
   * Update exercise infromation
   * @param {string} eid - exercise id
   * @param {object} exercise - exercise object
   * @returns {string} - Just sends a message to confirm that the update is complete
   */
router.patch('/:eid', /*requireLogin,*/ async (req, res) => {
	const exercise = req.body;
	const eid = req.params.eid;
    
  
	const dbExercise = await ExerciseModel.findByIdAndUpdate(
		eid,
		{
			title: exercise.title,
			question: exercise.question,
			answers: exercise.answers,
			dateUpdated: Date.now(),
		},
		function (err) {
			if (err) {
				res.status(400).send(err);
			}
		}
	);
	res.status(200).send(dbExercise);
});
  
  
/**
   * Get all exercises from a specific section id
   * @param {string} sid - section id
   * @returns {object} - exercises
   */
router.get('/section/:id', async (req, res) => {
  
	const id = req.params.id; // destructure params
	const exercise= await ExerciseModel.find({parentSection: id});
	res.send(exercise);
});
  


/**
 * Delete exercise from id
 * Remove it from the section exercises array
 * 
 * @param {string} id - Exercise id
 * @returns {string} - Just sends a message to confirm that the deletion is complete
 */
router.delete('/:id'/*, requireLogin*/, async (req, res) => {
	const { id } = req.params; // destructure params

	// Get the exercise object
	const exercise = await ExerciseModel.findById(id).catch((err) => {
		res.status(204).send(err);
	});

  
	// Remove the exercise from the section exercises array
	await SectionModel.updateOne({_id: exercise.parentSection}, {$pull: {components: {compId: exercise._id}}});


	// Delete the exercise object
	await ExerciseModel.findByIdAndDelete(id).catch(() => {
		res.status(204).send({ error: errorCodes['E1104'] });
	});

	// Send response
	res.status(200).send('Exercise Deleted');
});


module.exports = router;
