const date = new Date();

const getDate = () =>
	date.toLocaleDateString('us-EN', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
	});

const getDay = () =>
	date.toLocaleDateString('us-EN', {
		weekday: 'long',
	});

export { getDate, getDay };
