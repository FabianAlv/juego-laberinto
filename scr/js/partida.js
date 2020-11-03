// Creamos un elemento con el que podemos recuperar los valores que vienen en el url
const urlParams = new URLSearchParams(document.location.search);
const session = urlParams.get('session');
let player = urlParams.get('player');

//Se crea el websocket para enviar los datos
const socket = new WebSocket('ws://34.204.79.230:8080');

//Variable para saber si el socket está abierto y poder enviar los mensajes
let isOpen = false;
// Confirmamos que el socket se abrio correctamente
socket.onopen = function(event) {
	isOpen = true;

	const messageGetGame = {
		'type': 'getGame',
		'session': session,
		'player': player,
	};

	socket.send(JSON.stringify(messageGetGame));
};

function sendData(messageType) {
	if (isOpen) {
		switch (messageType) {
		case 'movePlayer':
			//
			break;
		case 'insertPiece':
			//
			break;
		case 'endTurn':
			//
			break;
		}
	}
}

/** ----------- Construccion inicial del juego ----------- **/

// Tablero que guarda las piezas actuales dentro del tablero
let logicBoard = [];
// Tablero que guarda los tesoros actuales dentro del tablero
let treasureBoard = [];
// La pieza extra
let extraPieceLB = 0;
let extraPieceTB = 0;
// El numero actual de jugadores conectados
let players = [];

//Tesoro del jugador
let assignedTreasure = 0;

// Tablero de puntajes
const playersTable = document.getElementById('inGame');
const ptBody = playersTable.getElementsByTagName('tbody')[0];

function setupGame(obj) {
	// Construimos la representacion visual del tablero
	setUpVisualBoard(obj['game']);

	// Guardamos la version loica del tablero
	logicBoard = obj['game']['board'];

	// Guardamos el tablero con los tesorors
	treasureBoard = obj['game']['treasures'];

	// Le mostramos al jugador la tarjeta con la que empezaria a jugar
	assignTreasure();

	// Ponemos las flechas a funcionar
	setUpArrowsLogic();
}

/** ----------- Construccion visual del tablero ----------- **/

// Tipo de pieza dependiendo del valor
//                    0   1   2   3    4   5    6    7    8   9    10   11   12   13   14  15 
const pieceFigure = ['', '', '', 'l', '', 'i', 'l', 't', '', 'l', 'i', 't', 'l', 't', 't', ''];
// Rotacion dependiendo del valor
//                      0   1   2    3    4   5    6     7     8    9     10    11    12    13     14   15
const rotationAngle = ['', '', '', '90', '', '0', '0', '270', '', '180', '90', '0', '270', '90', '180', ''];

function setUpVisualBoard(game) {
	const table = document.getElementById('game');

	const rows = game['rows'];
	const columns = game['columns'];

	const board = game['board'];

	const arrows = game['arrows'];

	const treasures = game['treasures'];

	players = game['players'];
	let playerN = 1;

	let tableBody = '';
	tableBody += '<tbody>';

	for (let r = 0; r < rows + 2; ++r) {
		tableBody += '<tr>';
		for (let c = 0; c < columns + 2; ++c) {
			if (r === 0) {
				if (arrows['columns'].includes(c - 1))
					tableBody += '<td><img src="./img/flechaAbajo.png" alt="Flecha apuntando hacia abajo" class="verticalArrow insert" data-col="' + c + '" data-pos="arriba"/></td>';
				else
					tableBody += '<td></td>';
			} else if (r === rows + 1) {
				if (arrows['columns'].includes(c - 1))
					tableBody += '<td><img src="./img/flechaArriba.png" alt="Flecha apuntando hacia arriba" class="verticalArrow insert" data-col="' + c + '" data-pos="abajo"/></td>';
				else
					tableBody += '<td></td>';
			} else if (c === 0) {
				if (arrows['rows'].includes(r - 1))
					tableBody += '<td><img src="./img/flechaDerecha.png" alt="Flecha apuntando hacia la izquierda" class="horizontalArrow insert" data-col="' + r + '" data-pos="izq"/></td>';
				else
					tableBody += '<td></td>';
			} else if (c === columns + 1) {
				if (arrows['rows'].includes(r - 1))
					tableBody += '<td><img src="./img/flechaIzquierda.png" alt="Flecha apuntando hacia la derecha" class="horizontalArrow insert" data-col="' + r + '" data-pos="der"/></td>';
				else
					tableBody += '<td></td>';
			} else {
				let pieceImg = pieceFigure[board[r - 1][c - 1]];

				tableBody += '<td><div class="boardPieceContainer">';
				tableBody += '<img src="./img/' + pieceImg + '.png" alt="Pieza del tablero en forma de ' + pieceImg + ' rotacion ' + rotationAngle[board[r - 1][c - 1]] + '" class="boardPiece rotate' + rotationAngle[board[r - 1][c - 1]] + '" />';

				if (treasures[r - 1][c - 1])
					tableBody += '<img src="./img/' + treasures[r - 1][c - 1] + '.png" alt="Tesoro ' + treasures[r - 1][c - 1] + '" class="tresure" />';

				if (playerN <= players.length) {
					if ((r - 1 === 0 && c - 1 === 0) || (r - 1 === 0 && c - 1 === columns - 1) || (r - 1 === rows - 1 && c - 1 === 0) || (r - 1 === rows - 1 && c - 1 === columns - 1)) {
						tableBody += '<img id="player' + playerN + '" src="./img/f' + playerN + '.png" alt="Ficha del jugador ' + playerN + '" class="player" />';

						++playerN;
					}
				}

				tableBody += '</div></td>';
			}
		}
		tableBody += '</tr>';
	}

	tableBody += '</tbody>';

	table.innerHTML = tableBody;

	// Colocamos la pieza extra
	extraPieceLB = parseInt(game['extraPiece']);
	const extraPieceDiv = document.getElementsByClassName('extra')[0];


	let ectraPieceImg = pieceFigure[extraPieceLB];

	extraPieceDiv.innerHTML = '<img src="./img/' + ectraPieceImg + '.png" alt="Pieza en forma de ' + ectraPieceImg + '" class="boardPiece rotate0 extraPiece" />';

	let ptNewBody = '';

	for (let i = 0; i < players.length; ++i) {
		let id = i + 1;
		if (id === game['first'])
			ptNewBody += '<tr id="player' + id + 'Row"><th>' + players[i] + '<img id="clock" src="./img/clock1.png"></img></th><td>0</td><td><img class="playerFigure" src="./img/f' + id + '.png"/></td></tr>';
		else
			ptNewBody += '<tr id="player' + id + 'Row"><th>' + players[i] + '</th><td>0</td><td><img class="playerFigure" src="./img/f' + id + '.png"/></td></tr>';


	}

	ptBody.innerHTML = ptNewBody;


	// Vemos si este es el jugador que empieza
	if (parseInt(player) === game['first']) 
		currentState = stateAddExtraPiece;
	else {
		const game = document.getElementById('game');
		game.classList.add('notYourTurn');
	}
}

/** ----------- Orden en el que se realiza el turno ----------- **/

const stateAddExtraPiece = 'addExtraPiece'; // 1. Ingresar la pieza extra en el tablero
const stateMovePlayer = 'movePlayer'; // 2. Escoger a donde moverse
const stateEndTurn = 'endTurn'; // 3. Terminar turno
const stateNotYourTurn = 'notYourTurn'; // 4. No poder hacer nada

let currentState = stateNotYourTurn; // Lo ponemos en el estado inicial

/** ----------- 1 ----------- **/

/** ----------- Rotar pieza extra ----------- **/
function tryRotatePiece() {
	if (currentState === stateAddExtraPiece) {
		rotatePiece();

		const messageRotatePiece = {
			'type': 'rotatePiece',
			'session': session,
			'player': player,
		};

		socket.send(JSON.stringify(messageRotatePiece));
	}

}

function rotatePiece() {

	extraPieceLB = rotations[extraPieceLB];

	let extraPieceImg = document.getElementsByClassName('extraPiece')[0];

	let rotation = extraPieceImg.className;

	switch (rotation) {
	case 'boardPiece rotate0 extraPiece':
		extraPieceImg.className = 'boardPiece rotate90 extraPiece';
		break;

	case 'boardPiece rotate90 extraPiece':
		extraPieceImg.className = 'boardPiece rotate180 extraPiece';
		break;

	case 'boardPiece rotate180 extraPiece':
		extraPieceImg.className = 'boardPiece rotate270 extraPiece';
		break;

	case 'boardPiece rotate270 extraPiece':
		extraPieceImg.className = 'boardPiece rotate0 extraPiece';
		break;
	}

}

/** ----------- Animación de flechas ----------- **/


const seconds = 1; // seconds
let extraPieceDiv;

function setUpArrowsLogic() {
	for (const arrow of document.getElementsByClassName('insert'))
		arrow.addEventListener('click', () => tryInsert(arrow.dataset.col, arrow.dataset.pos));
}

function tryInsert(col, pos) {
	if (currentState === stateAddExtraPiece) {
		startInsert(col, pos);

		const messageInsertExtraPiece = {
			'type': 'insertExtraPiece',
			'session': session,
			'player': player,
			'col': col,
			'pos': pos,
		};

		socket.send(JSON.stringify(messageInsertExtraPiece));

		// Seteamos lo necesario para poder mover el jugador
		setTimeout(function() {
			checkForPosiblePaths();

			updateTable(pathsBoard);
		}, 1000);

		currentState = stateMovePlayer;
	}
}

// Variables con las que sabemos que flexha habilitar y deshabilitar
let colArrow = 0;
let posArrow = 0;


function startInsert(col, pos) {

	const tablero = document.getElementById('game');
  
	let newColArrow = col;
	let newPosArrow = 0;

	col = parseInt(col);
	extraPieceDiv = document.getElementsByClassName('extra')[0];

	if (pos === 'der' || pos === 'abajo') {
		recorrerTablero(tablero, -1, col, pos);

		newPosArrow = 'arriba';
		if (pos === 'der')
			newPosArrow = 'izq';
	} else {
		recorrerTablero(tablero, 1, col, pos);

		newPosArrow = 'abajo';
		if (pos === 'izq')
			newPosArrow = 'der';
	}

	// Deshabilitamos y habilitamos las flechas
	if (colArrow !== 0) {
		for (const arrow of document.getElementsByClassName('insert')) {
			if (arrow.dataset.col === colArrow && arrow.dataset.pos === posArrow) 
				arrow.classList.remove('noArrow');
		}
	}

	for (const arrow of document.getElementsByClassName('insert')) {
		if (arrow.dataset.col === newColArrow && arrow.dataset.pos === newPosArrow) 
			arrow.classList.add('noArrow');
	}

	colArrow = newColArrow;
	posArrow = newPosArrow;

	updateLogicAndTreasureBoard(col, pos);
}


//Recorre el tablero, en filas o columnas, dependiendo de la flecha presionada
function recorrerTablero(tablero, fin, col, pos) {

	//Almacena los elementos div que contienen las piezas del tablero, los tesoros y las fichas
	let images = [];

	let numImages = tablero.rows.length - 1;
	if (pos === 'izq' || pos === 'der') 
		numImages = tablero.rows[0].cells.length - 1;
  

	for (let row = 1; row < numImages; row++) {

		let cell;
		let translation;
		let img;

		// Se obtiene la celda, y se recorre en columnas o filas
		// Se asigna X o Y dependiendo del movimiento que se debe hacer
		if (pos === 'arriba' || pos === 'abajo') {
			cell = tablero.rows[row].cells[col];
			translation = 'Y';
		} else {
			cell = tablero.rows[col].cells[row];
			translation = 'X';
		}

		// Obtiene el div que está en el td, el cual contiene las imágenes
		img = cell.getElementsByTagName('div')[0];

		// Se obtiene la altura del div que contiene las imágenes
		let height = getComputedStyle(img).height;
		height = (fin === 1) ? height : '-' + height;

		// Se le asigna la duración a la animación
		img.style.transition = `transform ${seconds}s ease-in-out`;

		// Hace que se mueva hacia abajo, o hacia el lado un espacio (de tamaño del div)
		img.style.transform = `translate${translation}(${height}) `;

		// Se almacena el elemento div en el arreglo
		images.push(img);
	}

	//Cuando se desliza de izquierda a derecha o de abajo para arriba
	if (pos === 'arriba' || pos === 'izq')
		images.reverse();


	//Recorrer el arreglo images para poder intercambiar los elementos div
	setTimeout(function() {
		const lastSrc = images[images.length - 1];
		for (let index = images.length - 1; index > 0; --index)
			endAnimation(images[index - 1], images[index]);

		//Se elimina el formato de la pieza extra y se le agrega la clase de las piezas del tablero
		extraPieceDiv.classList.remove('extra');
		extraPieceDiv.classList.add('boardPieceContainer');

		extraPieceDiv.getElementsByClassName('extraPiece')[0].classList.remove('extraPiece');

		//Se llama al método para intercambiar las piezas
		changeExtraPiece(tablero, images[0], extraPieceDiv);
		endAnimation(images[0], extraPieceDiv);

	}, 1000);

}


function changeExtraPiece(tablero, newPiece, oldPiece) {
	//Limpia las animaciones
	newPiece.style.transition = '';
	newPiece.style.transform = '';
	//Agrega el formato de pieza extra a la nueva pieza extra
	newPiece.classList.add('extra');
	newPiece.getElementsByTagName('img')[0].classList.add('extraPiece');

	// Agregamos el metodo para poder rotar la pieza
	newPiece.onclick = tryRotatePiece;

	//recorrer la pieza para eliminar la ficha del jugador
	let players = newPiece.getElementsByClassName('player');
	let player;

	for (let i = 0; i < players.length; ++i) {
		player = players[i];
		oldPiece.appendChild(player);
	}
}

function endAnimation(img, newSrc) {

	// Limpia las animaciones 
	newSrc.style.transition = '';
	newSrc.style.transform = '';

	//Reemplaza el div, por el nuevo div que entra como parámetro
	const tableTd = img.parentElement;
	const tableTd2 = newSrc.parentElement;
	tableTd.removeChild(img);
	tableTd.appendChild(newSrc);
	tableTd2.appendChild(img);
}

function updateLogicAndTreasureBoard(pos, dir) {
	let otherPieceLB = 0;
	let otherPieceTB = 0;

	const position = parseInt(pos) - 1;

	if (dir === 'izq') {
		for (let c = 0; c < logicBoard[0].length; ++c) {
			// Intercambiamos las piezas del tablero
			otherPieceLB = logicBoard[position][c];
			logicBoard[position][c] = extraPieceLB;
			extraPieceLB = otherPieceLB;

			// Intercambiamos los tesoros del tablero
			otherPieceTB = treasureBoard[position][c];
			treasureBoard[position][c] = extraPieceTB;
			extraPieceTB = otherPieceTB;
		}
	} else if (dir === 'arriba') {
		for (let r = 0; r < logicBoard.length; ++r) {
			// Intercambiamos las piezas del tablero
			otherPieceLB = logicBoard[r][position];
			logicBoard[r][position] = extraPieceLB;
			extraPieceLB = otherPieceLB;

			// Intercambiamos los tesoros del tablero
			otherPieceTB = treasureBoard[r][position];
			treasureBoard[r][position] = extraPieceTB;
			extraPieceTB = otherPieceTB;
		}
	} else if (dir === 'der') {
		for (let c = logicBoard[0].length - 1; c >= 0; --c) {
			// Intercambiamos las piezas del tablero
			otherPieceLB = logicBoard[position][c];
			logicBoard[position][c] = extraPieceLB;
			extraPieceLB = otherPieceLB;

			// Intercambiamos los tesoros del tablero
			otherPieceTB = treasureBoard[position][c];
			treasureBoard[position][c] = extraPieceTB;
			extraPieceTB = otherPieceTB;
		}
	} else if (dir === 'abajo') {
		for (let r = logicBoard.length - 1; r >= 0; --r) {
			// Intercambiamos las piezas del tablero
			otherPieceLB = logicBoard[r][position];
			logicBoard[r][position] = extraPieceLB;
			extraPieceLB = otherPieceLB;

			// Intercambiamos los tesoros del tablero
			otherPieceTB = treasureBoard[r][position];
			treasureBoard[r][position] = extraPieceTB;
			extraPieceTB = otherPieceTB;
		}
	}
}

/** ----------- 2 ----------- **/


/** ----------- Crear el tablero de posibles caminos ----------- **/

//                   Izquierda, Arriba, Derecha, Abajo
//                        1000,   0100,    0010,  0001
const enteringPoint = [8, 4, 2, 1];
// Valor binario para cada pieza
// L: 0110 ( 6), 0011 ( 3), 1001 (9), 1100 (12)
// I: 0101 ( 5), 1010 (10)
// T: 1011 (11), 1101 (13), 1110 (14), 0111 (7)
//
// Bin Rotando     0, 1, 2, 3, 4,  5, 6,  7, 8,  9, 10, 11, 12, 13, 14, 15
const rotations = [0, 0, 0, 9, 0, 10, 3, 11, 0, 12, 5, 13, 6, 14, 7, 0];

let pathsBoard = [];


// Construye el tablero binario
function checkForPosiblePaths() {
	const playerImg = document.getElementById('player' + player);
	const playerCell = playerImg.parentElement.parentElement;
	const playerRow = playerCell.parentNode.rowIndex - 1;
	const playerColumn = playerCell.cellIndex - 1;

	pathsBoard = [];

	// Creamos el pathsBoard sin posibles caminos
	for (let r = 0; r < logicBoard.length; ++r) {
		let pathsRow = [];

		for (let c = 0; c < logicBoard[r].length; ++c)
			pathsRow.push(false);

		pathsBoard.push(pathsRow);
	}

	checkForPosiblePahtsR(playerRow, playerColumn, -1);
}

const left = 0;
const up = 1;
const right = 2;
const down = 3;

function checkForPosiblePahtsR(row, column, direction) {
	// Verificamos que sea una posicion valida
	// Verificar que es un lugar por el que aun no se ha revisado
	// Verificamos que por el lugar que quieren entrar es valido
	if (!(row < 0 || row >= pathsBoard.length || column < 0 || column >= pathsBoard[0].length) && !(pathsBoard[row][column]) && (direction === -1 || (enteringPoint[direction] & logicBoard[row][column]) === enteringPoint[direction])) {
		// Si entramos aqui quiere decir que es una posicion al la que puede ir
		pathsBoard[row][column] = true;

		// Revisamos izquierda
		if ((enteringPoint[left] & logicBoard[row][column]) === enteringPoint[left])
			checkForPosiblePahtsR(row, column - 1, right, pathsBoard);

		// Revisamos arriba
		if ((enteringPoint[up] & logicBoard[row][column]) === enteringPoint[up])
			checkForPosiblePahtsR(row - 1, column, down, pathsBoard);

		// Revisamos derecha
		if ((enteringPoint[right] & logicBoard[row][column]) === enteringPoint[right])
			checkForPosiblePahtsR(row, column + 1, left, pathsBoard);

		// Revisamos abajo
		if ((enteringPoint[down] & logicBoard[row][column]) === enteringPoint[down])
			checkForPosiblePahtsR(row + 1, column, up, pathsBoard);
	}
}

/** ----------- Mover la ficha de un jugador ----------- **/

// Cada vez que el tablero se modifica hay que actulizar los metodos de las celdas
function updateTable() {

	if (currentState === stateMovePlayer) {
		//Agarrar la posición de una celda para 
		let table = document.getElementById('game');
		let cells = table.getElementsByTagName('td');

		for (let i = 1; i < cells.length; i++) {

			let cell = cells[i];

			if (cell.children[0] && cell.children[0].className === 'boardPieceContainer') {
				if (pathsBoard[cell.parentNode.rowIndex - 1][cell.cellIndex - 1]) {
					cell.onclick = function() {
						tryMovePosPlayer(cell.parentNode.rowIndex, cell.cellIndex, 'player' + player);
					};
				} else
					cell.onclick = null;
			}
		}
	}
}

function tryMovePosPlayer(cellRow, cellColumn, playerId) {
	if (currentState === stateMovePlayer) {
		movePosPlayer(cellRow, cellColumn, playerId);

		const messageMovePlayer = {
			'type': 'movePlayer',
			'session': session,
			'player': player,
			'row': cellRow,
			'column': cellColumn,
		};

		socket.send(JSON.stringify(messageMovePlayer));
	}
}

function movePosPlayer(cellRow, cellColumn, playerId) {
	// Obtenmos la posicion del jugador
	const playerImg = document.getElementById(playerId);
	const playerCell = playerImg.parentElement.parentElement;
	const playerRow = playerCell.parentNode.rowIndex;
	const playerColumn = playerCell.cellIndex;

	// Obtenemos la posicion de la celda a donde se quiere trasladar
	const table = document.getElementById('game');
	const cell = table.rows[cellRow].cells[cellColumn];

	// Obtenemos cuando es lo que se debe trasladar
	const newLeft = 50 + (100 * (cellColumn - playerColumn));
	const newTop = 50 + (100 * (cellRow - playerRow));

	// Hacemos la animacion
	playerImg.style.top = `${newTop}%`;
	playerImg.style.left = `${newLeft}%`;

	setTimeout(function() {
		// Quitamos las animacion
		playerImg.style.top = '';
		playerImg.style.left = '';

		//Tomar la imagen y pasarla de celda
		cell.children[0].appendChild(playerImg);
	}, 1000);
}

// Los tesoros que ya ha agarrado
let pickedTreasures = [];

function assignTreasure() {
	let card = document.getElementById('code');
	let randomRow = 0;
	let randomCol = 0;

	//Se asigna el tesoro al jugador
	while (assignedTreasure === 0 || pickedTreasures.includes(assignedTreasure)) {
		randomRow = Math.floor(Math.random() * treasureBoard.length);
		randomCol = Math.floor(Math.random() * treasureBoard[0].length);
		assignedTreasure = treasureBoard[randomRow][randomCol];
	}

	//Se muestra la carta al jugador
	card.innerHTML = assignedTreasure;

}


function checkTreasure(cellRow, cellColumn, playerId) {

	let sound = new Audio('./img/correct.wav');
	//Se verifica si el jugador cayó en un tesoro
	if (treasureBoard[cellRow - 1][cellColumn - 1] !== 0) {

		//Verifica si es su tesoro  actualiza la tabla con la cantidad de cartas recolectadas
		if (treasureBoard[cellRow - 1][cellColumn - 1] === assignedTreasure) {
			let cardPos;
			cardPos = document.getElementById(playerId + 'Row');

			pickedTreasures.push(assignedTreasure);

			setTimeout(function() {
				let foundCards = parseInt(cardPos.getElementsByTagName('td')[0].innerHTML);
				foundCards++;
				if (foundCards === 5) 
					playerWon();
                
				cardPos.getElementsByTagName('td')[0].innerHTML = foundCards;
				sound.play();
			}, 1000);

			assignTreasure();

			//Envía el mensaje al servidor
			const messageFindTreasure = {
				'type': 'findTreasure',
				'session': session,
				'player': player,
			};

			socket.send(JSON.stringify(messageFindTreasure));
		}
	}
}


function otherPlayerFoundTreasure(playerId) {
	let cardPos;
	cardPos = document.getElementById(playerId + 'Row');

	setTimeout(function() {
		let foundCards = parseInt(cardPos.getElementsByTagName('td')[0].innerHTML);
		foundCards++;
		cardPos.getElementsByTagName('td')[0].innerHTML = foundCards;
	}, 1000);

}

function playerWon() {
	//Envía el mensaje al servidor
	const messagePlayerWon = {
		'type': 'playerWon',
		'session': session,
		'player': player,
	};

	socket.send(JSON.stringify(messagePlayerWon));

	setTimeout(function() {
		if (parseInt(player) === 1) 
			document.location.href = 'sala-espera-organizador.xhtml?session=' + session + '&player=' + player;

		else 
			document.location.href = 'sala-espera-jugador.xhtml?session=' + session + '&player=' + player;
        
	}, 1500);
}

function otherPlayerWon() {
	setTimeout(function() {
		if (parseInt(player) === 1) 
			document.location.href = 'sala-espera-organizador.xhtml?session=' + session + '&player=' + player;

		else 
			document.location.href = 'sala-espera-jugador.xhtml?session=' + session + '&player=' + player;
        
	}, 1500);
}


/** ----------- 3 ----------- **/

function tryeEndTurn() {
	if (currentState === stateMovePlayer) {
		endTurn(parseInt(player));

		const messageEndTurn = {
			'type': 'endTurn',
			'session': session,
			'player': player,
		};

		socket.send(JSON.stringify(messageEndTurn));

		currentState = stateNotYourTurn;
    
		const game = document.getElementById('game');
		game.classList.add('notYourTurn');

		//Verifica si hay tesoro y si es el tesoro del jugador
		let id = document.getElementById('player' + player);
		const playerCell = id.parentElement.parentElement;
		const playerRow = playerCell.parentNode.rowIndex;
		const playerColumn = playerCell.cellIndex;

		checkTreasure(playerRow, playerColumn, 'player' + player);
	}
}

function endTurn(endingPlayer) {
	let nextPlayer = endingPlayer + 1;

	if (nextPlayer > players.length)
		nextPlayer = 1;

	const endingPlayerTH = document.getElementById('player' + endingPlayer + 'Row').getElementsByTagName('th')[0];
	const nextPlayerTH = document.getElementById('player' + nextPlayer + 'Row').getElementsByTagName('th')[0];
	endingPlayerTH.innerHTML = players[endingPlayer - 1];
	nextPlayerTH.innerHTML = players[nextPlayer - 1] + '<img id="clock" src="./img/clock1.png"></img>';

	if (nextPlayer === parseInt(player)) {
		currentState = stateAddExtraPiece;

		const game = document.getElementById('game');
		game.classList.remove('notYourTurn');
	}
}

/** ----------- Abandonar partida ----------- **/

function leaveGame() {
	if (currentState !== stateNotYourTurn) {
		const messageLeaveGame = {
			'type': 'leaveGame',
			'session': session,
			'player': player,
		};
	
		socket.send(JSON.stringify(messageLeaveGame));
	
		// Nos vamos a la vista inicial
		document.location.href = 'index.xhtml';
	}
}

function playerLeaves(playerLeaving) {
	let removableTR = document.getElementById('player'+playerLeaving+'Row');
	let notRemovableTR = 0;
	let nextPlayer = playerLeaving + 1;

	// Actualizamos la tabla de puntajes y las fichas
	if (playerLeaving === players.length) {
		nextPlayer = 1;
    
		notRemovableTR = document.getElementById('player'+nextPlayer+'Row');
		notRemovableTR.getElementsByTagName('th')[0].innerHTML += '<img id="clock" src="./img/clock1.png"></img>';
	} else {
		for (let i = playerLeaving; i < players.length; ++i) {
			notRemovableTR = removableTR;
			removableTR = document.getElementById('player'+(i+1)+'Row');

			if (i !== playerLeaving) 
				notRemovableTR.getElementsByTagName('th')[0].innerHTML = removableTR.getElementsByTagName('th')[0].innerHTML;
			else
				notRemovableTR.getElementsByTagName('th')[0].innerHTML = removableTR.getElementsByTagName('th')[0].innerHTML + '<img id="clock" src="./img/clock1.png"></img>';
			
			notRemovableTR.getElementsByTagName('td')[0].innerHTML = removableTR.getElementsByTagName('td')[0].innerHTML;
		}
	}
	
	// Preguntamos si ahora es nuestro turno
	if (nextPlayer === parseInt(player)) {
		const game = document.getElementById('game');
		game.classList.remove('notYourTurn');
    
		currentState = stateAddExtraPiece;
	}

	// Eliminamos la ficha del jugador que se retiro
	document.getElementById('player'+playerLeaving).remove();

	// Actualizamos los id's de las fichas
	for (let i = playerLeaving + 1; i <= players.length; ++i)
		document.getElementById('player'+i).id='player'+(i-1);

	if (playerLeaving < parseInt(player))
		player = ''+(parseInt(player)-1);

	players.splice(playerLeaving - 1, 1);

	// Removemos 
	removableTR.remove();
}

/** ----------- Recibir mensajes del servidor ----------- **/

socket.onmessage = function(event) {
	let obj = JSON.parse(event.data);

	switch (obj['type']) {
	case 'game':
		// Recibimos la informacion del juego
		setupGame(obj);
		break;

	case 'rotatePiece':
		rotatePiece();
		break;

	case 'insertExtraPiece':
		startInsert(obj['col'], obj['pos']);
		break;

	case 'movePlayer':
		movePosPlayer(parseInt(obj['row']), parseInt(obj['column']), 'player' + obj['player']);
		break;

	case 'endTurn':
		endTurn(parseInt(obj['player']));
		break;

	case 'findTreasure':
		otherPlayerFoundTreasure('player' + obj['player']);
		break;

	case 'playerWon':
		otherPlayerWon();
		break;

	case 'leaveGame':
		playerLeaves(parseInt(obj['player']));
		break;
	}
};
