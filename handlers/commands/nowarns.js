'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');
const { logError } = require('../../utils/log');
const { parse, strip } = require('../../utils/parse');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getUser, nowarns } = require('../../stores/user');
const { listGroups } = require('../../stores/group');

const noop = Function.prototype;

// This handler is very similiar to commands/unban.
// When adding a feature here, please consider adding it there too.

/** @param { import('../../typings/context').ExtendedContext } ctx */
const nowarnsHandler = async ({ from, message, reply, telegram }) => {
	if (!from || from.status !== 'admin') return null;

	const { targets } = parse(message);

	if (targets.length !== 1) {
		return reply(
			'ℹ️ <b>Kechirim so\'ramoqchi bo\'lgan foydalanuvchini ko\'rsating.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	const userToUnwarn = await getUser(strip(targets[0]));

	if (!userToUnwarn) {
		return reply(
			'❓ <b>User unknown.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	const { warns } = userToUnwarn;

	if (warns.length === 0) {
		return reply(
			`ℹ️ ${link(userToUnwarn)} <b>allaqachon ogohlantirishlari yo\'q.</b>`,
			replyOptions
		);
	}

	if (userToUnwarn.status === 'banned') {
		const groups = await listGroups();

		groups.forEach(group =>
			telegram.unbanChatMember(group.id, userToUnwarn.id));
	}

	try {
		await nowarns(userToUnwarn);
	} catch (err) {
		logError(err);
	}

	if (userToUnwarn.status === 'banned') {
		telegram.sendMessage(
			userToUnwarn.id,
			'♻️ Siz hamma /groups ro\'yxatidagi guruhlar banidan olindingiz!'
		).catch(noop);
		// it's likely that the banned person haven't PMed the bot,
		// which will cause the sendMessage to fail,
		// hance .catch(noop)
		// (it's an expected, non-critical failure)
	}

	return reply(
		`♻️ ${link(from)} ${link(userToUnwarn)}ni <b>kechirdi</b> ` +
		'<b>va hamma ogohlantiruvlar olib tayladi.</b>',
		replyOptions
	);
};


module.exports = nowarnsHandler;
