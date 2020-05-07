const config = {
	'iceServers': [
		{ 'urls': ['stun:stun.1.google.com:19302']}
	]
};

const socket = io.connect(window.location.origin);
const video = document.querySelector('video');

window.onunload = window.onbeforeunload = function() {
	socket.close();
}