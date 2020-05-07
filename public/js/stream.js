const peerConnections = {};
const constraints = {
	// audio: true,
	video: {facingMode: "user"}
};

navigator.mediaDevices.getUserMedia(constraints)
.then((stream) => {
	video.srcObject = stream;
	socket.emit('broadcaster');
}).catch(error => console.error(error));

socket.on('answer', (id, description) => {
	peerConnections[id].setRemoteDescription(description);
});

socket.on('watcher', (id) => {
	const peerConnection = new RTCPeerConnection(config);
	peerConnections[id] = peerConnection;
	let stream = video.srcObject;
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
	peerConnection.createOffer()
	.then(sdp => peerConnection.setLocalDescription(sdp))
	.then(function () {
		socket.emit('offer', id, peerConnection.localDescription);
	});
	peerConnection.onicecandidate = function(event) {
		if (event.candidate) {
			socket.emit('candidate', id, event.candidate);
		}
	};
});

socket.on('candidate', (id, candidate, count) => {
	peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('bye', (id) => {
	peerConnections[id] && peerConnections[id].close();
	delete peerConnections[id];
});
