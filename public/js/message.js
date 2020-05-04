console.log('i am message.js');

const messageForm = document.getElementById('messageForm');

const handleSubmitMessage = () => {
	event.preventDefault();

	console.log(' i am handle submit message');

	const messageInput = document.getElementById('messageInput');

	if(messageInput) {

		const date = new Date();
		const datetext = date.toTimeString().split(' ')[0];

		const messageObj = {
			content: messageInput.value,
			// author: localStorage.getItem('uid')
			author: state.username,
			date: datetext
		};

		state.socket.emit('new message', ({messageObj}));

		messageInput.value = "";
	}
}

messageForm.addEventListener('submit', handleSubmitMessage);