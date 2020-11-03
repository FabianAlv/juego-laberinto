const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });


wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		const obj = JSON.parse(message);

		switch (obj['type']) {
		case 'createSession':
			createSession(ws, obj);
			break;

		case 'joinSession':
			joinSession(ws, obj);
			break;

		case 'waitingPlayer':
			addWaitingPlayer(ws, obj);
			break;

		case 'createGame':
			createGame(ws, obj);
			break;

		case 'getGame':
			getGame(ws, obj);
			break;

		case 'rotatePiece':
			broadcast(obj['session'], obj, parseInt(obj['player']) - 1);
			break;

		case 'insertExtraPiece':
			broadcast(obj['session'], obj, parseInt(obj['player']) - 1);
			break;

		case 'movePlayer':
			broadcast(obj['session'], obj, parseInt(obj['player']) - 1);
			break;

		case 'findTreasure':
			broadcast(obj['session'], obj, parseInt(obj['player']) - 1);
			break;

		case 'endTurn':
			broadcast(obj['session'], obj, parseInt(obj['player']) - 1);
			break;

		case 'playerWon':
			playerWon(obj);
			break;

		case 'leaveGame':
			leaveGame(obj);
			break;
		}
	});

	ws.on('close', function close() {
		// Buscamos a cual sesion pertenecia el socket
	});
});

// Variable que guarda el codigo de la sesion
let sessions = new Object();

//Arreglo que contiene los tesoros 
let treasuresArray = ['bee', 'water', 'avocado', 'tree', 'airplane', 'whale', 'bananas', 'ship', 'horse', 'pumpkin', 'bed',
	'car', 'pig', 'cherry', 'rocket', 'bathtub', 'elephant', 'mirror', 'stove', 'strawberry', 'hen', 'iceCream', 'mushrooms',
	'ant', 'egg', 'toilet', 'lamp', 'lion', 'apple', 'butterfly', 'monkey', 'orange', 'bear', 'bird', 'duck', 'dog', 'pillow',
	'penguin', 'pineapple', 'iron', 'chicken', 'fridge', 'clock', 'watermelon', 'shark', 'grapes', 'cow'
];

// Flujo a seguir para jugar
// 1. Recibir la solicitud de crear una sesion y crearla
// 2. Recibir la solicitud de los jugadores que se quieren unir a la sesion y agregarlos
// 3. Poner a los jugadores en sala de espera
// 4. Recibir la solicitud para crear el tablero y crearlo
// 5. Avisrle a los jugadores que ya la partida esta lista
// 6. Enviarle el tablero a los jugadores que ya estan dentro de la partida
// 7. Reenviar mensajes con la informacion de lo que cada jugador esta haciendo

/** ----------- Construccion de la sesion ----------- **/

function createSession(ws, obj) {
	// Creamos un valor hexadecimal para la sesion
	let sessionCode = (Math.random() * 0xfffff * 1000000).toString(16);
	while (sessions[sessionCode])
		sessionCode = (Math.random() * 0xfffff * 1000000).toString(16);

	// Le agregamos los contenedores de los datos de la sesion
	sessions[sessionCode] = {
		'sessionPlayers': [obj.player],
		'playersVictories': [0],
		'playersSockets': ['', '', '', ''],
	};

	const messageCreatedSession = {
		'type': 'createdSession',
		'session': sessionCode,
		'player': sessions[sessionCode]['sessionPlayers'].length,
	};

	ws.send(JSON.stringify(messageCreatedSession));
}

/** ----------- Conexion de los demas jugadores ----------- **/

function joinSession(ws, obj) {
	const session = obj['session'];
	// Verificamos que la sesion existe
	if (sessions[session]) {
		// Verificamos que la sesion no este llena
		if (sessions[session]['sessionPlayers'].length < 4) {
			// Creamos los datos del jugador en la sesion
			sessions[session]['sessionPlayers'].push(obj['player']);
			sessions[session]['playersVictories'].push(0);

			// Le enviamos al jugador los datos de la sesion
			const messageJoinedSession = {
				'type': 'joinedSession',
				'session': session,
				'player': sessions[session]['sessionPlayers'].length,
			};

			ws.send(JSON.stringify(messageJoinedSession));
		} else {
			// Respondemos que la sesion ya esta llena
			const messageSessionNotJoinable = {
				'type': 'sessionNotJoinable',
				'error': 'The session you are trying to join is already full. :(',
			};

			ws.send(JSON.stringify(messageSessionNotJoinable));
		}
	}
}

/** ----------- Poner los jugadores en la sala de espera ----------- **/

function addWaitingPlayer(ws, obj) {
	const session = obj['session'];
	// Verificamos que la sesion existe
	if (sessions[session]) {
		// Guardamos el socket para poder avisarle cuando la partida esta lista
		const player = parseInt(obj['player']);
		sessions[session]['playersSockets'][player - 1] = ws;

		// Construimos el mensaje con los datos actuales
		const messageCurrentPlayers = {
			'type': 'currentPlayers',
			'sessionPlayers': sessions[session]['sessionPlayers'],
			'playersVictories': sessions[session]['playersVictories'],
		};

		// Le hacemos broadcast para actualizar los datos de los jugadores en la sala de espera
		broadcast(session, messageCurrentPlayers);
	}
}



/** ----------- Jugador ganó ----------- **/
function playerWon(obj) {
	const session = obj['session'];
	sessions[session]['playersVictories'][parseInt(obj['player']) - 1]++;

	broadcast(session, obj, parseInt(obj['player']) - 1);

}


/** ----------- Construccion del juego ----------- **/

// Pasos para alistar un juego
// 1. Creamos el tablero
// 2. Decimos en donde se deben colocar las flechas
// 3. Decimos en donde se colocan los tesoros
// 4. Indicamos la cantidad de jugadores
// 5. Guardamos los datos y le indicamos a los jugadores que ya pueden pasar a la partida

function createGame(ws, obj) {
	const session = obj['session'];
	// Verificamos que la sesion existe
	if (sessions[session]) {
		const rows = parseInt(obj['rows']);
		const columns = parseInt(obj['columns']);

		// 1
		const board = createBoard(rows, columns);
		const extraPiece = pieceRotation[Math.floor(Math.random() * 3)][0];

		// 2
		const arrows = arrowsLocation(rows, columns);

		// 3
		const treasures = treasureLocations(rows, columns);

		// 4
		const players = sessions[session]['sessionPlayers'];
		const first = Math.ceil(Math.random() * players.length);

		// 5
		const game = {
			'rows': rows,
			'columns': columns,
			'board': board,
			'extraPiece': extraPiece,
			'arrows': arrows,
			'treasures': treasures,
			'players': players,
			'first': first,
		};

		sessions[session]['game'] = game;

		const messageGameReady = {
			'type': 'gameReady',
		};

		sessions[session]['playersSockets'].forEach(playerSocket => {
			if (playerSocket)
				playerSocket.send(JSON.stringify(messageGameReady));
		});

		ws.send(JSON.stringify(messageGameReady));
	}
}

/** ----------- 1 ----------- **/

//                      L             I       T
const pieceRotation = [
	[6, 3, 9, 12],
	[5, 10],
	[11, 13, 14, 7]
];
const L = 0;
const I = 1;
const T = 2;

const d0 = 0;
const d90 = 1;
const d180 = 2;
const d270 = 3;

function createBoard(rows, columns) {
	// Construimos el tablero
	const board = createEmptyBoard(rows, columns);

	// Colocamos las esquinos
	insertCorners(board, rows, columns);

	// Colocamos las piezas del borde que no se pueden mover
	insertImmobileBorder(board, rows, columns);

	// Colocamos las piezas internas que no se puedenmover
	insertImmobilePieces(board, rows, columns);

	// Colocamos el resto de las piezas
	insertMobilesPieces(board);

	return board;
}

// Crea un tablero lleno de ceros y en el cual vamos a agregar las piezas
function createEmptyBoard(rows, columns) {
	const emptyBoard = [];

	for (let r = 0; r < rows; ++r) {
		const row = [];

		for (let c = 0; c < columns; ++c)
			row.push(0);

		emptyBoard.push(row);
	}

	return emptyBoard;
}

// Coloca las esquinas del tablero
function insertCorners(board, rows, columns) {
	board[0][0] = 3;
	board[0][columns - 1] = 9;
	board[rows - 1][columns - 1] = 12;
	board[rows - 1][0] = 6;
}

// Colocamos los bordes que no son se pueden mover
function insertImmobileBorder(board, rows, columns) {

	// Ponemos los bordes verticales

	let jumperRow = 0;
	let jumpRow = 0;

	if (rows % 2 === 0) {
		jumperRow = Math.floor((rows - 1) / 2);
		jumpRow = -1;
		if (rows % 4 === 0) {
			jumperRow -= 1;
			jumpRow = 1;
		}
	}

	for (let r = 2; r < rows - 2; r += 2) {
		board[r][0] = pieceRotation[T][d90];
		board[r][columns - 1] = pieceRotation[T][d270];

		if (r === jumperRow)
			r += jumpRow;
	}

	// Ponemos los bordes hprizontales

	let jumperColumn = 0;
	let JumpColumn = 0;

	if (columns % 2 === 0) {
		jumperColumn = Math.floor((columns - 1) / 2);
		JumpColumn = -1;
		if (columns % 4 === 0) {
			jumperColumn -= 1;
			JumpColumn = 1;
		}
	}

	for (let c = 2; c < columns - 2; c += 2) {
		board[0][c] = pieceRotation[T][d0];
		board[rows - 1][c] = pieceRotation[T][d180];

		if (c === jumperColumn)
			c += JumpColumn;
	}
}

function insertImmobilePieces(board, rows, columns) {
	let jumperRow = 0;
	let jumperColumn = 0;

	let jumpRow = 0;
	let JumpColumn = 0;

	if (rows % 2 === 0) {
		jumperRow = Math.floor((rows - 1) / 2);
		jumpRow = -1;
		if (rows % 4 === 0) {
			jumperRow -= 1;
			jumpRow = 1;
		}
	}

	if (columns % 2 === 0) {
		jumperColumn = Math.floor((columns - 1) / 2);
		JumpColumn = -1;
		if (columns % 4 === 0) {
			jumperColumn -= 1;
			JumpColumn = 1;
		}
	}

	for (let r = 2; r < rows - 2; r += 2) {
		for (let c = 2; c < columns - 2; c += 2) {
			let randomRotation = Math.floor(Math.random() * 4);
			board[r][c] = pieceRotation[T][randomRotation];

			if (c === jumperColumn)
				c += JumpColumn;
		}

		if (r === jumperRow)
			r += jumpRow;
	}
}

function insertMobilesPieces(board) {

	for (let r = 0; r < board.length; ++r) {
		for (let c = 0; c < board[r].length; ++c) {
			if (!board[r][c]) {
				let randomPiece = Math.random();
				let rotation = Math.floor(Math.random() * 4);

				if (randomPiece <= 0.47)
					board[r][c] = pieceRotation[L][rotation];
				else if (randomPiece <= 0.82)
					board[r][c] = pieceRotation[I][rotation % 2];
				else
					board[r][c] = pieceRotation[T][rotation];
			}
		}
	}
}

/** ----------- 2 ----------- **/

function arrowsLocation(rows, columns) {
	const arrows = {
		'rows': [],
		'columns': [],
	};

	let jumperRow = 0;
	let jumpRow = 0;

	if (rows % 2 === 0) {
		jumperRow = Math.floor(rows / 2) - 2;
		jumpRow = 1;
		if (rows % 4 === 0) {
			jumperRow += 1;
			jumpRow = -1;
		}
	}

	for (let r = 1; r < rows - 1; r += 2) {
		arrows['rows'].push(r);

		if (r === jumperRow)
			r += jumpRow;
	}

	let jumperColumn = 0;
	let JumpColumn = 0;

	if (columns % 2 === 0) {
		jumperColumn = Math.floor(columns / 2) - 2;
		JumpColumn = 1;
		if (columns % 4 === 0) {
			jumperColumn += 1;
			JumpColumn = -1;
		}
	}

	for (let c = 1; c < columns - 1; c += 2) {
		arrows['columns'].push(c);

		if (c === jumperColumn)
			c += JumpColumn;
	}

	return arrows;
}

/** ----------- 3 ----------- **/

function treasureLocations(rows, columns) {

	const treasures = createEmptyBoard(rows, columns);

	let i = 0;
	let row = 0;
	let column = 0;
	while (i < 24) {
		row = Math.floor(Math.random() * rows);
		column = Math.floor(Math.random() * columns);

		if (!treasures[row][column] && !((row === 0 && column === 0) ||
                (row === 0 && column === columns - 1) || (row === rows - 1 && column === 0) ||
                (row === rows - 1 && column === columns - 1))) {
			let t = treasuresArray[Math.floor(Math.random() * 47)];
			let notFound = true;
			for (let i = 0; i < treasures.length; i++) {
				if (treasures[i].indexOf(t) !== -1) 
					notFound = false;
                
			}
			if (notFound) 
				treasures[row][column] = t;
            
			++i;
		}
	}

	return treasures;
}

/** ----------- Iniciar el juego ----------- **/

function getGame(ws, obj) {
	const session = obj['session'];
	const player = parseInt(obj['player']);
	// Verificamos que la sesion existe
	if (sessions[session]) {

		const messageGame = {
			'type': 'game',
			'game': sessions[session]['game'],
		};

		sessions[session]['playersSockets'][player - 1] = ws;

		ws.send(JSON.stringify(messageGame));
	}
}

/** ----------- Abandonar partida ----------- **/

function leaveGame(obj) {
	const session = obj['session'];
	// Verificamos que la sesion existe
	if (sessions[session]) {
		const playerPos = parseInt(obj['player']) - 1;
		// Le avisamos a los demas que un jugador se retira
		broadcast(session, obj, playerPos);

		// Actualizamos los datos de la sesion
		sessions[session]['sessionPlayers'].splice(playerPos, 1);
		sessions[session]['playersVictories'].splice(playerPos, 1);
		sessions[session]['playersSockets'].splice(playerPos, 1);
		sessions[session]['playersSockets'].push('');
	}
}

/** ----------- Acer broadcast de un mensaje ----------- **/

function broadcast(session, message, excludePlayer = -1) {
	const playersSockets = sessions[session]['playersSockets'];

	if (excludePlayer === -1) {
		// Actuaizamos los datos de los jugadores conectados
		playersSockets.forEach(playerSocket => {
			// Verificamos que haya un socket
			if (playerSocket)
				playerSocket.send(JSON.stringify(message));
		});
	} else {
		for (let i = 0; i < playersSockets.length; ++i) {
			if (playersSockets[i] && i !== excludePlayer)
				playersSockets[i].send(JSON.stringify(message));
		}
	}
}