const { FeedbackOptionsModel } = require('../models/FeedbackOptions');
const errorCodes = require('./errorCodes');
const { CustomError } = require('./error');

//default feedback options
const feedbackOptionsList = [
	{'name': 'Aulas interessantes'},
	{'name': 'Profissionais didáticos'},
	{'name': 'Aulas dinâmicas'},
	{'name': 'Conteúdo informativo'},
	{'name': 'Bom material didático'},
];

//populate the db with new feedback options so they don't appear empty
async function populate() {
	try {
		const existingOptions = await FeedbackOptionsModel.find({});
		const optionsToInsert = feedbackOptionsList.filter(option => {
			return !existingOptions.some(existingOption => existingOption.name === option.name);
		});
		await FeedbackOptionsModel.insertMany(optionsToInsert);
	} catch {
		throw new CustomError(errorCodes.E1305);
	}
}

module.exports = { populate };