const emailHelper = require('../../helpers/email');

jest.mock('nodemailer', () => {
	return {
		createTransport: jest.fn(() => {
			return {
				sendMail: jest.fn(),
			};
		}),
	};
});

jest.mock('../../config/keys', () => {
	return {
		GMAIL_USER: 'educadotest4@gmail.com',
		GMAIL_APP_PASSWORD: 'test',
	};
});

describe('sendResetPasswordEmail', () => {

	it('should return email if email is sent', async () => {
		const user = {
			firstName: 'John',
			email: 'test@email.com',
		};
		const token = '1234';

		const expectedMailOptions = {
			subject: 'Reset password request for Educado',
			from: 'educadotest4@gmail.com',
			to: user.email,
			text: `Hi ${user.firstName},\n\nYou have requested to reset your password. Please enter the following code in the app to reset your password:\n\n${token}` +
        '\n\nThis code will expire in 5 minutes.\n\nIf you did not request to reset your password, please ignore this email. Your password will remain unchanged.' +
        '\n\nBest regards,\nThe Educado team',
			html: `<p>Hi ${user.firstName},</p>\n` +
        '<p>You have requested to reset your password. Please enter the following code in the app to reset your password:</p>\n' +
        `<p><strong>${token}</strong></p>\n` +
        '<p>This code will expire in 5 minutes.</p>\n' +
        '<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>\n' +
        '<p>Best regards,</p>\n' +
        '<p>The Educado team</p>'
		};

		const result = await emailHelper.sendResetPasswordEmail(user, token);
		expect(result).toMatchObject(expectedMailOptions);
	});
});

describe('sendMail', () => {

	it('should return email if email is sent', async () => {
		const mailOptions = {
			subject: 'Test email',
			from: 'educadotest4@gmail.com',
			to: 'test@user.com',
			text: 'This is a test email',
			html: '<p>This is a test email</p>'
		};

		const result = await emailHelper.sendMail(mailOptions);
		expect(result).toMatchObject(mailOptions);
	});

	it('should throw error if email is invalid', async () => {
		const mailOptions = {
			subject: 'Test email',
			from: 'invalid',
			to: '',
			text: 'This is a test email',
			html: '<p>This is a test email</p>'
		};

		await expect(emailHelper.sendMail(mailOptions)).rejects.toThrow('Invalid email');
	});
});

describe('sendVerificationEmail', () => {

	it('should return email if email is sent', async () => {
		const user = {
			firstName: 'John',
			email: 'test@email.com',
		};
		const token = '1234';

		const expectedMailOptions = {
			subject: 'Educado verifique seu e-mail',
			from: 'educadotest4@gmail.com',
			to: user.email,
			text: `Olá ${user.firstName},\n\nNós recebemos uma solicitação para criar conta no Educado.\n\nUse esse código para validar: ${token}\n\nEsse código é válido por 5 minutos.\n\nEquipe Educado. `,
			html: `<p>Olá ${user.firstName},</p>\n<p>Nós recebemos uma solicitação para criar conta no Educado.</p>\n<p>Use esse código para validar: <strong>${token}</strong></p>\n<p>Esse código é válido por 5 minutos.</p>\n<p>Equipe Educado.</p>`,
		};

		const result = await emailHelper.sendVerificationEmail(user, token);
		expect(result).toMatchObject(expectedMailOptions);
	});
});