//Se crea el websocket para enviar los datos
const socket = new  WebSocket('ws://34.204.79.230:8080');

// Confirmamos que la conexion se hizo exitosamente
var isOpen = false;
socket.onopen = function (event) {
	isOpen = true;
};

/** ----------- Unirse a una sesion ----------- **/

function joinSession() {
	if (isOpen) {
		let messageJoinSession = {
			'type':'joinSession',
			'player': document.getElementById('playerName').value,
			'session': document.getElementById('sessionCode').value,
		};
	
		socket.send(JSON.stringify(messageJoinSession));
	}
}

/** ----------- Recibir mensajes del servidor ----------- **/

socket.onmessage = function(event) {
	let obj = JSON.parse(event.data);
  
	if (obj['type'] === 'joinedSession') {
		socket.close();
		document.location.href = 'sala-espera-jugador.xhtml?session=' + obj['session'] + '&player=' + obj['player'];
	} else if (obj['type'] === 'sessionNotJoinable') 
		console.error(obj.error);
	
};
