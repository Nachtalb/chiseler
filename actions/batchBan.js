'use strict';

const { batchBan, ensureExists } = require('../stores/user');
const { displayUser, escapeHtml } = require('../utils/tg');

module.exports = async ({ admin, reason, targets }) => {
	const by_id = admin.id;
	const date = new Date();

	await Promise.all(targets.map(ensureExists));

	const banned = await batchBan(targets, { by_id, date, reason });
	const bannedString = banned.map(displayUser).join(', ');

	return `${displayUser(admin)} ${bannedString} <b>ga quyidagi sabab tufayli ban berdi:</b>

${escapeHtml(reason)}`;
};
