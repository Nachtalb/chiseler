'use strict';

// Utils
const { scheduleDeletion } = require('../../utils/tg');

// DB
const { managesGroup } = require('../../stores/group');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const linkHandler = async ({ chat, replyWithHTML }, next) => {
	if (chat.type === 'private') {
		return next();
	}

	const group = await managesGroup({ id: chat.id });

	return replyWithHTML(group.link || '️ℹ️ <b>Bu guruhni ssilkasi yo\'q</b>')
		.then(scheduleDeletion());
};

module.exports = linkHandler;
