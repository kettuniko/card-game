import http from 'http'
import fs from 'fs'
import path from 'path'
import socketIO from 'socket.io'
const server = http.createServer()
const io = socketIO(server)

let clients = []

let games = []

const cards = fs.readdirSync('img')
  .map(fileName => path.basename(`img/${fileName}`, '.png'))
  .map(name => ({name}))

export const start = port => {
  io.on('connection', (socket) => {
    const client = {
      clientId: new Date(),
      socket: socket
    }
    clients.push(client)

    if (clients.length === 2) {
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
        console.log('sending msg to client')
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

    socket.on('play-card', (card) => console.log('playing card', card))
    socket.on('disconnect', () => console.log('client disconnected', client))
  })
  server.listen(port)
}

