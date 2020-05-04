console.log('i am message.js');

const messageForm = document.getElementById('messageForm');

const handleSubmitMessage = () => {
	event.preventDefault();

	console.log(' i am handle submit message');

	const messageInput = document.getElementById('messageInput');

	if(messageInput) {

		cont messageObj = {
			message: messageInput.value,
			author: localStorage.getItem('uid');
		}

		socket.emit('new message', ({messageObj}));
	}
}

messageForm.addEventListener('submit', handleSubmitMessage);