console.log('i am create-stream.js');

const createStreamBtn = document.getElementById('createStream');

const heroSection = document.querySelector('.hero');

const createStreamID = () => {
	return Math.random().toString(36).substr(2, 9);
}

const createStream = () => {
	const streamID = createStreamID();

	const streamLink = window.location.origin + '/stream?' + streamID;

	const viewerLink = window.location.origin + '/view?' + streamID;

	heroSection.innerHTML = `
		<h2>STREAM IS LIVE</h2>
		<p>Broadcast your webcam: <a href=${streamLink}>${streamLink}</a></p>
		<p>Invite your friends: <a href=${viewerLink}>${viewerLink}</a></p>
	`;

}

createStreamBtn.addEventListener('click', createStream);