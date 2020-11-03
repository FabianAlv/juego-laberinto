//Se crea el websocket para enviar los datos
const socket = new  WebSocket('ws://34.204.79.230:8080');

// Confirmamos que la conexion se hizo exitosamente
var isOpen = false;
socket.onopen = function (event) {
	isOpen = true;
};

/** ----------- Construccion de la sesion ----------- **/

function createSession() {
	if (isOpen) {
		let messageCreateSession = {
			'type':'createSession',
			'player': document.getElementById('playerName').value,
		};
	
		socket.send(JSON.stringify(messageCreateSession));
	}
}

/** ----------- Recibir mensajes del servidor ----------- **/

socket.onmessage = function(event) {
	let obj = JSON.parse(event.data);
  
	if (obj['type'] === 'createdSession') {
		socket.close();
		document.location.href = 'sala-espera-organizador.xhtml?session=' + obj['session'] + '&player=' + obj['player'];
	}
};
