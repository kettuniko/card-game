var WebSocketServer = require('ws').Server

var server = new WebSocketServer({ port: 8080 });

var clients = []

var cards = [
	{name: "Heh"},
	{name: "Juu"},
	{name: "Kjeh"},
	{name: "Rengas"}
]

server.on('connection', function connection(ws) {

	clients.push(ws);

	if (clients.length == 2) {
		gameStart(clients);
		clients = []
	} else {
	}
	ws.on('message', incoming);

	ws.send('something');
});

function incoming(message) {
	console.log('received: %s', message);
}

function gameStart(clients) {
	clients[0].send({type: "gameStart", cards: cards});
	clients[1].send({type: "gameStart", cards: cards});
}
