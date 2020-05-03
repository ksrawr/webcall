const express = require('express');

const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);

const PORT = 4000;

app.use(express.static(__dirname + '/public'));

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

server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
})

