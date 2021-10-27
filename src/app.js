import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { getDate } from './utils/date.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define paths for Express config
const publicDir = join(__dirname, '../public');
const viewsDir = join(__dirname, '../templates/views');
// const partialsDir = path.join(__dirname, '../templates/partials');

const app = express();

// Serve static files from public/ (new root) index.html (default)
app.use(express.static(publicDir));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', viewsDir);

const listItems = [];
const workItems = [];

app.get('/', (req, res) => {
	res.render('list', { listTitle: getDate(), listItems });
});

app.post('/', (req, res) => {
	const { newListItem, listType } = req.body;

	if (listType === 'Work') {
		workItems.push(newListItem);
		res.redirect('/work');
		return;
	}

	listItems.push(newListItem[0].toUpperCase() + newListItem.slice(1));
	res.redirect('/');
});

app.get('/about', (req, res) => {
	res.render('about');
});

// Work List

app.get('/work', (req, res) => {
	res.render('list', { listTitle: 'Work List', listItems: workItems });
});

app.listen(80, () => console.log('Server Started'));
