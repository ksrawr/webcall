console.log(' i am app js');

let state = {
	username: '',
	email: '',
	messages: [],
	socket: io()
}

const messageList = document.getElementById('messageList');

const setState = (obj, callback) => {
	state = { ...state, ...obj};
	console.log({msg: 'set state', state});

	if(callback) callback();
}

const setSocketInfo = () => {
	state.socket.emit('session', {username: state.username, email: state.email}, (error) => {

		if(error) console.warn({error});

	})
}

const displayMessages = () => {
	console.log(state.messages);
	const messagesHTML = state.messages.map((message) => {
		return `
			<div>
				<p class="message">${message.author} [${message.date}]: ${message.content}</p>
			</div>
		`;
	}).join('');

	messageList.innerHTML = messagesHTML;
}

const getUserInfo = async () => {
	try {
		const id = localStorage.getItem('uid');
		const response = await fetch(`/api/v1/users/${id}`).then();

		const data = await response.json();

		console.log(data);

		const { name, email } = data.data;

		if(data.status === 200) {
			setState({
				'username': name,
				'email': email
			}, setSocketInfo)
		}
	} catch(error) {
		console.warn({error});
	}
}

//////////////////Listen to Server Socket Events

// Server Msgs ('who is connected, who has joined')
state.socket.on('message', (data) => {
	console.log({data});
})

// Active Users
state.socket.on('current users', (data) => {
	console.log({data});
})

// Receive new messages
state.socket.on('new message', (data) => {
	console.log(data);
	state.messages.push(data.messageObj);

	displayMessages();
})

getUserInfo();