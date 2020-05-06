console.log('i am video js');

const peerConnections = {};
let peerConnection;
let webCamStream;

const localVideo = document.querySelector('.localVideo');
const remoteVideo = document.querySelector('.remoteVideo');
const startBtn = document.querySelector('.startBtn');

state.socket.on('offer', (id, description) => {
	peerConnection = new webkitRTCPeerConnection(config);
})

const createPeerConnection = async() => {
	console.log('Setting up a peer connection');

	myPeerConnection = new RTCPeerConnection(configuration);
	myPeerConnection.onicecandidate = handleIceCandidate;
	myPeerConnection.oniceconnectionstatechange = handlePeerDisconnect;
	myPeerConnection.onnegotiatonneeded = handleNegotiationNeededEvent;
	myPeerConnection.ontrack = handleTrackServerStreams;
};

const handleServerMessage = (msg) => {

}

const handleIceCandidate = (event) => {
	if(event.candidate) {
		state.socket.emit('client message', {'candidate': event.candidate, 'event': 'new-ice-candidate'})
	}
}

const handlePeerDisconnect = (event) => {
	const iceState = myPeerConnection.iceConnectionState;

	console.log('ICE connection iceState changed: ', iceState);

	if(iceState === "closed" || iceState === "failed" || iceState === "disconnected") {
		closeCall();
	}
}

const closeCall = () => {
	if(myPeerConnection) {
		myPeerConnection.onicecandidate = null;
		myPeerConnection.oniceconnectionstatechange = null;
		myPeerConnection.onnegotiatonneeded = null;
		myPeerConnection.ontrack = null;

		myPeerConnection.getTransceivers().forEach(transceiver => {
			transceiver.stop();
		})
	}

	if(localVideo.srcObject) {
		localVideo.pause();
		localVideo.srcObject.getTracks().forEach(track => {
			track.stop();
		})
	}

	myPeerConnection.close();
	myPeerConnection = null;
	webCamStream = null;
}

const handleNegotiationNeededEvent = async() => {
	try {
		const offer = await myPeerConnection.createOffer();

		await myPeerConnection.setLocalDescription(offer);

		state.socket.emit('client message', { type: "video-offer", sdp: myPeerConnection.localDescription});
	} catch(error) {
		console.warn(error);
	}
}

const handleTrackServerStreams = (event) => {
	console.log('got remote stream');

	remoteVideo.srcObject = event.streams[0];

};

const startWebCam = async() => {

// 	if(navigator.mediaDevices.getUserMedia) {
// 		navigator.mediaDevices.getUserMedia({ video: true, audio: true })
// 			.then(stream => {
// 				state.stream = stream;
// 				
// 				localVideo.srcObject = stream;
// 
// 				state.yourConn = new RTCPeerConnection(configuration);
// 
// 				state.yourConn.addStream(stream);
// 
// 				state.yourConn.onaddstream = (event) => {
// 					remoteVideo.src = window.URL.createObjectURL(e.stream);
// 				};
// 
// 			})
// 	}

	console.log("Starting Call to invite users");
	
	createPeerConnection();

	try {
		webCamStream = await navigator.mediaDevices.getUserMedia(configuration);
		localVideo.srcObject = webCamStream;
	} catch(error) {
		console.error(error);
		alert(error);
		return;
	}

	try {
		webCamStream.getTracks().forEach(transceiver = track => myPeerConnection.addTransceiver(track, {streams: [webCamStream]}));
	} catch(error) {
		console.error(error);
		alert(error);
		return;
	}

}

startBtn.addEventListener('click', startWebCam);