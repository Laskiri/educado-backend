const keys = require('../config/keys');
const nodemailer = require('nodemailer');
const { patterns } = require('./patterns');

module.exports = Object.freeze({
	sendResetPasswordEmail,
	sendVerificationEmail,
	sendMail
});

/**
 * Function to send an email using nodemailer.
 * @param {Object} mail information about the mail to be sent, containing the following properties:
 * - subject: the subject of the email
 * - from: the sender of the email
 * - to: the recipient of the email
 * - text: the text of the email
 * - html: the html of the email
 * @param {String} mail.subject
 * @param {String} mail.from
 * @param {String} mail.to
 * @param {String} mail.text
 * @param {String} mail.html 
 */
async function sendMail({
	subject,
	from = keys.GMAIL_USER,
	to,
	text,
	html,
}) {

	if (!patterns.email.test(from) || !patterns.email.test(to)) {
		throw new Error('Invalid email');
	}

	const transporter = nodemailer.createTransport({
		service: 'gmail', // Send mail using gmail
		auth: { // Authenticate the gmail account (sender)
			type: 'login',
			user: keys.GMAIL_USER,
			pass: keys.GMAIL_APP_PASSWORD,

		},
		tls: {
			rejectUnauthorized: false, // Disable TLS/SSL certificate validation
		}
	});

	const mailOptions = {
		subject: subject,
		from: from,
		to: to,
		text: text,
		html: html
	};

	await transporter.sendMail(mailOptions);
	return mailOptions;
}


/**
 * 
 * @param {Object} user - containing the following properties:
 * - firstName: the first name of the user
 * - email: the email of the user
 * @param {String} user.firstName
 * @param {String} user.email
 * @param {PasswordResetToken} token 
 * @returns 
 */
async function sendResetPasswordEmail(user, token) {
	const subject = 'Reset password request for Educado';
	const to = user.email;
	const text = `Hi ${user.firstName},\n\nYou have requested to reset your password. Please enter the following code in the app to reset your password:\n\n${token}`+ 
    '\n\nThis code will expire in 5 minutes.\n\nIf you did not request to reset your password, please ignore this email. Your password will remain unchanged.' + 
    '\n\nBest regards,\nThe Educado team';
	const html = `<p>Hi ${user.firstName},</p>\n`+ 
    '<p>You have requested to reset your password. Please enter the following code in the app to reset your password:</p>\n' +
    `<p><strong>${token}</strong></p>\n`+ 
    '<p>This code will expire in 5 minutes.</p>\n'+
    '<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>\n'+
    '<p>Best regards,</p>\n' +
    '<p>The Educado team</p>';

	const mail = await sendMail({ subject, to, text, html });
	return mail;
}


/**
 * 
 * @param {Object} user - containing the following properties:
 * - firstName: the first name of the user
 * - email: the email of the user
 * @param {String} user.firstName
 * @param {String} user.email
   @param {EmailVerificationToken} token 
 * @returns 
 */
async function sendVerificationEmail(user,token) {
	const subject = 'Educado verifique seu e-mail';
	const to = user.email;
	const text = `Olá ${user.firstName},\n\nNós recebemos uma solicitação para criar conta no Educado.\n\nUse esse código para validar: ${token}\n\nEsse código é válido por 5 minutos.\n\nEquipe Educado. `;
	const html = `<p>Olá ${user.firstName},</p>\n<p>Nós recebemos uma solicitação para criar conta no Educado.</p>\n<p>Use esse código para validar: <strong>${token}</strong></p>\n<p>Esse código é válido por 5 minutos.</p>\n<p>Equipe Educado.</p>`;
	const mail = await sendMail({ subject, to, text, html });
	return mail;
}	
