const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const server = http.createServer(app);
const db = require('./models');
const io = require('socket.io').listen(server);

const PORT = 4000;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.use(session({
		store: new MongoStore({ url: "mongodb://localhost:27017/webcall" }),
		secret: "iamlesecretsecretsecret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 3 // expire in 24 hours
		}
	})
);

app.get('/', (req, res) => {
	res.sendFile('./views/index.html', {
		root: `${__dirname}/`
	})
})

// SOCKET TIME!!!!!!
const users = {};

io.on('connection', (socket) => {

	console.log('client connected');

	socket.on('session', ({username}, callback) => {

		const user = { username };

		if(!socket.user) users[socket.id] = {username, email}; 

		socket.user = user;

		console.log(users);

		socket.broadcast.emit('current users', {activeUsers: users});

		callback();

	});

	socket.on('join', ({roomspace, username}, callback) => {

		socket.join(roomspace);

		socket.emit('message', { user: 'admin', msg: `${username} has joined!`});

		return callback();

	});

	socket.on('send message', (msg) => {
		socket.broadcast.emit('send message', {
			username: socket.user,
			message: msg
		});
	})

	socket.on('disconnecting', () => {
		if(socket.user) {
			console.log('client is disconnecting', socket.user.username);
		}
	})

	socket.on('disconnect', () => {
		if(socket.user) {
			console.log('client disconnected', socket.user.username);
		}

		socket.emit('message', {msg: ''})

		delete users[socket.id];

		console.log(users);
	})

})

/////////////////////////// API TIME
app.post('/api/v1/register', async (req, res, next) => {

	try {

		const foundUser = await db.User.findOne({email: req.body.email})

		if (foundUser) {
			return res.status(409).json({message: "User already registered"});
		}

		// return res.status(200).json({msg: "no user found!"});
		const salt = await bcyrpt.genSalt(10);
		const hash = await bcrypt.hash(req.body.password, salt);

		const newUser = {
			name: req.body.name,
			email: req.body.email,
			password: hash,
		};

		const createdUser = await db.User.create(newUser);

		return res.status(201).json({message: "user created", status: 201});

	} catch (error) {
		console.log(error)
		return next(error)
	}

})

// Index Users Route
app.get('/api/v1/users', async(req, res, next) => {

	try {

		const users = await db.Users.find({});

		if(users) return res.status(200).json({users, status: 200});

	} catch(error) {
		console.log(error);
		return next(error);
	}

})

server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
})

