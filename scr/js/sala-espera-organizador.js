// Creamos un elemento con el que podemos recuperar los valores que vienen en el url
const urlParams = new URLSearchParams(document.location.search);
const session = urlParams.get('session');
const player = urlParams.get('player');

//Se crea el websocket para enviar los datos
const socket = new WebSocket('ws://34.204.79.230:8080');

// Confirmamos que la conexion se hizo exitosamente
socket.onopen = function(event) {
	// Le pedimos al servidor que nos envie la informacion
	let messageWaitingPlayer = {
		'type': 'waitingPlayer',
		'session': session,
		'player': player,
	};

	socket.send(JSON.stringify(messageWaitingPlayer));
};

// Lo que se hace en la sala de espera
// 1. Poner el código de la sesión en la vista
// 2. Cada vez que se conecta un jugador hay que actualizar la tabla
// 3. Ir a la vista para crear partidas

/** ----------- Poner código de la sesión ----------- **/

function insertSession() {
	const code = document.getElementById('code');
	code.innerHTML = urlParams.get('session');
}

insertSession();

/** ----------- Actualizar tabla de jugadores ----------- **/

function updatePlayersTable(obj) {
	const table = document.getElementById('currentPlayers');

	let tableBody = '';
	for (let i = 0; i < obj['sessionPlayers'].length; ++i) {
		tableBody += '<tr>' +
            '<th>' + obj['sessionPlayers'][i] + '</th>' +
            '<td>' + obj['playersVictories'][i] + '</td>' +
            '</tr>';
	}

	table.innerHTML = tableBody;
}

/** ----------- Ir a vista para crear tablero ----------- **/

function createBoard() {
	socket.close();
	document.location.href = 'crear-partida.xhtml?session=' + session + '&player=' + player;
}

/** ----------- Recibir mensajes del servidor ----------- **/

socket.onmessage = function(event) {
	let obj = JSON.parse(event.data);
	if (obj['type'] === 'currentPlayers') {
		// Actualizamos la tabla de jugadores
		updatePlayersTable(obj);
	}
};
