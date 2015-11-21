var WebSocketServer = require('ws').Server

var server = new WebSocketServer({ port: 8080 });

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

server.on('connection', function connection(ws) {

	var client = { 
		socket: ws,
		incoming: function(message) {
			console.log('received: %s', message);
		}
	}
	clients.push(client)

	if (clients.length == 2) {
		gameStart(clients);
		clients = []
	} else {

	}

	ws.on('message', client.incoming);

});

function incoming(message) {
}

function gameStart(clients) {
	var game = {
		clients: clients,
		currentPlayer: 0
	}
	games.push(game)
	game.clients.forEach(client => client.socket.send(JSON.stringify({type: "gameStart", cards: cards})))
}
