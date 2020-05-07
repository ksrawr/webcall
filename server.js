const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const server = http.createServer(app);
const db = require('./models');
const io = require('socket.io')(server);

let broadcaster;

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

// app.get('/', (req, res) => {
// 	if(req.session.currentUser) return res.redirect('/home');
// 	res.sendFile('./views/register.html', {
// 		root: `${__dirname}/`
// 	})
// })
// 
// app.get('/login', (req, res) => {
// 	if(req.session.currentUser) return res.redirect('/home');
// 	res.sendFile('./views/login.html', {
// 		root: `${__dirname}/`
// 	})
// })
// 
// app.get('/home', (req, res) => {
// 	if(!req.session.currentUser) return res.redirect('/login');
// 	res.sendFile('./views/index.html', {
// 		root: `${__dirname}/`
// 	})
// })

app.get('/stream', (req, res) => {
	res.sendFile('./views/streamer.html', {
		root: `${__dirname}/`
	});
})

app.get('/viewer', (req, res) => {
	res.sendFile('./views/viewer.html', {
		root: `${__dirname}/`
	});
})

// SOCKET TIME!!!!!!
const users = {};

io.sockets.on('connection', (socket) => {

	console.log('client connected');

	socket.on('broadcaster', () => {
		broadcaster = socket.id;
		console.log("broadcaster", broadcaster);
		socket.broadcast.emit('broadcaster');
	})

	socket.on('watcher', () => {
		broadcaster && socket.to(broadcaster).emit('watcher', socket.id);
	})

	socket.on('offer', (id, message) => {
		socket.to(id).emit('offer', socket.id, message);
	})

	socket.on('answer', (id, message) => {
		socket.to(id).emit('answer', socket.id, message);
	})

	socket.on('candidate', (id, message) => {
		socket.to(id).emit('candidate', socket.id, message);
	})

	socket.on('session', ({username, email}, callback) => {

		const user = { username };

		if(!socket.user) users[socket.id] = {username, email}; 

		socket.user = user;

		console.log(users);

		const date = new Date();
		const datetext = date.toTimeString().split(' ')[0];

		io.emit('message', { author: 'admin', content: `${username} has joined.`, date: datetext});

		socket.emit('current users', {activeUsers: users});

		callback();

	});

	socket.on('join', ({username}, callback) => {

		// socket.join(roomspace);

		socket.emit('message', { user: 'admin', msg: `${username} has joined!`});

		return callback();

	});

	socket.on('new message', (msg) => {
		io.emit('new message', msg);
	})

	socket.on('client message', (msg) => {
		console.log('client message received: ', msg);
		socket.broadcast.emit('server message', msg);
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
		const salt = await bcrypt.genSalt(10);
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

		const users = await db.User.find({});

		if(!users) return res.status(404).json({message: 'no users', status: 404});

		return res.status(200).json({users, status: 200});

	} catch(error) {
		console.log(error);
		return next(error);
	}

})

// Login Route 
app.post('/api/v1/login', async(req, res, next) => {

	try {
		const foundUser = await db.User.findOne({email: req.body.email});

		if(!foundUser) return res.status(404).json({message: "user not registered"});

		const isMatch = await bcrypt.compare(req.body.password, foundUser.password);

		if(isMatch) {
			req.session.currentUser = {
				id: foundUser._id,
				name: foundUser.name,
				email: foundUser.email
			};

			res.status(200).json({data: foundUser._id, message: "Success", status: 200});
		} else {
			return res.status(400).json({message: "Username/passsword is correct"});
		}
	} catch(error) {
		console.log(error);
		return next(error);
	}

})

// Logout Route
app.delete('/api/v1/logout', async(req, res, next) => {

	try {

		if(!req.session.currentUser) return res.status(401).json({message: "unauthorized"});

		const sessionDestroyed = await req.session.destroy();
		
		return res.status(200).json({message: 'logout success', status: 200});

	} catch(error) {
		console.log(error);
		return next(error);
	}

})

// Show User Route
app.get('/api/v1/users/:id', async(req, res, next) => {

	try {
		const foundUser = await db.User.findById(req.params.id);

		return res.status(200).json({data: foundUser, status: 200})
	} catch(error) {
		console.log({error});
		return next(error);
	}

})

server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
})

