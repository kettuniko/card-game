import http from 'http'
import socketIO from 'socket.io'
const server = http.createServer();
const io = socketIO(server);

let clients = []

let games = []

const cards = [
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

export const start = port => {
  io.on('connection', function (socket) {
    const client = {
      clientId: new Date(),
      socket: socket
    }
    clients.push(client)

    if (clients.length == 2) {
      const players = [
        {
          id: clients[0].clientId,
          cards: cards
        },
        {
          id: clients[1].clientId,
          cards: cards
        }
      ]

      const gameState = {
        message: 'Game start!',
        players: players,
        currentPlayer: players[0], // TODO
        opponent: players[1] // TODO
      }

      const game = {
        clients: clients,
        gameState: gameState
      }
      games.push(game)

      game.clients.forEach(client => {
        console.log('sending msg to client');
        client.socket.emit('game-start', JSON.stringify({
          gameState: gameState
        }))
      })

      //	game.clients[0].socket.send(JSON.stringify({type: "yourTurn"}))

      //	game.clients[1].socket.send(JSON.stringify({type: "enemyTurn"}))
      clients = []
    } else {
      console.log('waiting for other player')
    }

    socket.on('play-card', (card) => console.log('playing card', card));
    socket.on('disconnect', () => console.log('client disconnected', client));
  });
  server.listen(port);
}

