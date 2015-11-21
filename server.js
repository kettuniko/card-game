var WebSocketServer = require('ws').Server

var server = new WebSocketServer({ port: 8080 });

var clients = []

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

	clients.push(ws);

	if (clients.length == 2) {
		gameStart(clients);
		clients = []
	} else {

	}
	ws.on('message', incoming);

});

function incoming(message) {
	console.log('received: %s', message);
}

function gameStart(clients) {
	clients.forEach(client => client.send(JSON.stringify({type: "gameStart", cards: cards})))
}
