import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import _ from 'lodash';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// import { getDate } from './utils/date.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define paths for Express config
const publicDir = join(__dirname, '../public');
const viewsDir = join(__dirname, '../templates/views');

// Setting Port
const port = process.env.PORT;
port ||= 80;

const app = express();

// Serve static files from public/ (new root) index.html (default)
app.use(express.static(publicDir));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', viewsDir);

const listTitle = 'Today';

// Setting Up Database
// * Connecting to DB
(async function () {
	await mongoose.connect(
		'mongodb+srv://admin-vatsal:7252@cluster0.6gjjw.mongodb.net/todolistDB'
	);
})().catch(err => console.error(err));

// * Creating a Schema -> Defines structure (Template)
const itemSchema = new mongoose.Schema({
	name: String,
});

const listSchema = {
	name: String,
	items: [itemSchema],
};

// * Creating a Model -> Creates Collection
const Item = mongoose.model('Item', itemSchema);
const List = mongoose.model('List', listSchema);

// * Creating a Document -> Record (DATA) in Collection
const item1 = new Item({
	name: 'Welcome to your todo list',
});

const item2 = new Item({
	name: 'Hit the + button to add new item',
});

const item3 = new Item({
	name: '<--- Hit this to delete the item',
});

const defaultItems = [item1, item2, item3];

app.get('/', (req, res) => {
	Item.find((err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		if (!data.length) {
			Item.insertMany(defaultItems, err => {
				if (err) console.error(err);
				else console.log('Inserted Succesfully!');
			});

			res.redirect('/');
			return;
		}

		res.render('list', { listTitle, listItems: data });
	});
});

app.post('/', (req, res) => {
	const { newListItem, listName } = req.body;
	// List Item
	const newItem = new Item({
		name: newListItem[0].toUpperCase() + newListItem.slice(1),
	});

	// If listTitle list
	if (listName === listTitle) {
		newItem.save();
		res.redirect('/');
		return;
	}

	// If custom list
	// * Finding the custom list so we can push the item in it
	List.findOne({ name: listName }, (err, foundList) => {
		if (err) {
			console.error(err);
			return;
		}

		foundList.items.push(newItem);
		foundList.save();
		res.redirect(`/list/${listName}`);
	});
});

app.post('/delete', (req, res) => {
	const { id, listName } = req.body;

	// If listTitle list
	if (listName === listTitle) {
		Item.findByIdAndDelete(id, err => {
			if (err) console.error(err);
			else console.log('Deleted Succesfully!');
		});
		res.redirect('/');
		return;
	}

	// If custom list
	// * Finding the custom list so we can remove the item in it
	List.findOneAndUpdate(
		{ name: listName },
		{ $pull: { items: { _id: id } } },
		(err, data) => {
			if (err) console.error(err);
			else console.log(`${listName} modified successfully!`);
		}
	);
	res.redirect(`/list/${listName}`);
});

app.get('/about', (req, res) => {
	res.render('about');
});

//* Routing
app.get('/list/:listName', (req, res) => {
	const listName = _.capitalize(req.params.listName);

	List.findOne({ name: listName }, (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		if (!data) {
			const list = new List({
				name: listName,
				items: defaultItems,
			});
			list.save();
			res.redirect(`/list/${listName}`);
			return;
		}

		res.render('list', { listTitle: listName, listItems: data.items });
	});
});

app.get('*', (req, res) => {
	res.send('Error 404. Page not found!');
});

app.listen(port, () => console.log(`Server Started at ${PORT}`));
