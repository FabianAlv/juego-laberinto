// Creamos un elemento con el que podemos recuperar los valores que vienen en el url
const urlParams = new URLSearchParams(document.location.search);
const session = urlParams.get('session');
const player = urlParams.get('player');

//Se crea el websocket para enviar los datos
const socket = new  WebSocket('ws://34.204.79.230:8080');

// Confirmamos que la conexion se hizo exitosamente
let isOpen = false;
socket.onopen = function (event) {
	isOpen = true;
};

/** ----------- Construccion del tablero ----------- **/

function createBoard() {
	if (isOpen) {
		const rows = document.getElementById('rowNumber').value;
		const columns = document.getElementById('columnNumber').value;
  
		const messageCreateBoard = {
			'type': 'createGame',
			'session': session,
			'player': player,
			'rows': rows,
			'columns': columns,
		};
    
		socket.send(JSON.stringify(messageCreateBoard));
	}
}

/** ----------- Recibir mensajes del servidor ----------- **/

socket.onmessage = function(event) {
	let obj = JSON.parse(event.data);
	
	if (obj['type'] === 'gameReady') {
		// Nos vamos a la vista de partida
		document.location.href = 'partida.xhtml?session=' + session + '&player=' + player;
	}
};
