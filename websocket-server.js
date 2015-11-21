var WebSocketServer = require('ws').Server

var server = new WebSocketServer({ port: 8081 });

var clients = []

var games = []

var cards = [
	{name: "card_1"},
	{name: "card_2"},
	{name: "card_3"},
	{name: "card_4"},
	{name: "card_5"},
	{name: "card_6"},
	{name: "card_7"},
	{name: "card_8"},
	{name: "card_9"},
	{name: "card_10"},
	{name: "card_11"}
]

server.on('connection', function connection(socket) {

	var client = { 
		clientId: new Date(),
		socket: socket,
		/*incoming: function(message) {
			console.log('received: %s', message);
		}*/
	}
	clients.push(client)

	if (clients.length == 2) {
		gameStart(clients);
		clients = []
	} else {

	}

	socket.on('message', clientListener);

});

function clientListener(message) {
	var message = JSON.parse(message)
	console.log(message.type)
}

function gameStart(clients) {
	var gameState = {
		players: [
			{id: clients[0].clientId, cards: cards},
			{id: clients[1].clientId, cards: cards}
		],
		currentPlayer: 0
	}

	var game = {
		clients: clients,
		gameState: gameState
	}
	games.push(game)

	game.clients.forEach(client => client.socket.send(JSON.stringify({
		type: "gameStart", 
		gameState: gameState,
		cards: cards
	})))

//	game.clients[0].socket.send(JSON.stringify({type: "yourTurn"}))

//	game.clients[1].socket.send(JSON.stringify({type: "enemyTurn"}))

}

