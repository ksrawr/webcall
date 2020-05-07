let peerConnection;
let viewers = 0;

socket.on('offer', (id, description) => {
	console.log('offer has been made');
	peerConnection = new RTCPeerConnection(config);
	peerConnection.setRemoteDescription(description)
		.then(() => peerConnection.createAnswer())
		.then(sdp => peerConnection.setLocalDescription(sdp))
		.then(() => {
			socket.emit('answer', id, peerConnection.localDescription);
		});

	peerConnection.ontrack = event => video.srcObject = event.streams[0];

	peerConnection.onicecandidate = event => {
		if(event.candidate) {
			socket.emit('candidate', id, event.candidate);
		}
	}; 

})

socket.on('candidate', (id, candidate, count) => {
	viewers = count;
	peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
		.catch(e => console.error(e));
})

socket.on('connect', () => {
	socket.emit('watcher');
})

socket.on('broadcaster', () => {
	socket.emit('watcher');
})

socket.on('bye', () => {
	peerConnection.close();
})