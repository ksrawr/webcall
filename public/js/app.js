console.log(' i am app js');

let state = {
	username: '',
	email: '',
	socket: io()
}

const setState = (obj, callback) => {
	state = { ...state, ...obj};
	console.log({msg: 'set state', state});

	if(callback) callback();
}

const setSocketInfo = () => {
	state.socket.emit('session', {username: state.username, email: state.email}, (error) => {

		if(error) console.warn({error});

	})

	state.socket.on('current users', (data) => {
		console.log({data});
	})
}

const getUserInfo = async () => {
	try {
		const id = localStorage.getItem('uid');
		const response = await fetch(`/api/v1/users/${id}`);

		const data = response.json();

		const { name, status, email } = data.data;

		if(status === 200) {
			setState({
				'username': name
				'email': email
			}, setSocketInfo)
		}
	} catch(error) {
		console.warn({error});
	}
}