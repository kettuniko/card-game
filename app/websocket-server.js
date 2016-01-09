import http from 'http'
import fs from 'fs'
import path from 'path'
import socketIO from 'socket.io'
import Bacon from 'baconjs'
import _ from 'lodash'
const server = http.createServer()
const io = socketIO(server)

const playerConnects = Bacon.fromEvent(io, 'connection')
const playersPerGame = 2

const cards = fs.readdirSync('img')
  .map(fileName => path.basename(`img/${fileName}`, '.png'))
  .map(name => ({name}))

const chooseRandomCards = () => _.chain(cards).shuffle().take(5).value()

export const start = port => {
  server.listen(port)
  playerConnects.bufferWithCount(playersPerGame).onValue(startGame)
}

const createId = () => new Date().getTime()
const offTurn = () => ({inTurn: false})
const onTurn = () => ({inTurn: true})
const to = receiver => state => ({state, receiver})
const send = gameMessage => gameMessage.receiver.emit('game-state', JSON.stringify(gameMessage.state))

const startGame = players => {
  const cardsPlayed = []
  const playerCards = players.map(player => ({id: player.id, cards: chooseRandomCards()}))

  const findOpponent = player => players.find(p => p !== player)
  const findCards = player => _.findWhere(playerCards, {id: player.id}).cards

  const addCardToPlayed = card => cardsPlayed.push({...card, playId: createId()})
  const removeCardFromPlayer = player => card => {
    const playerCards = findCards(player)
    playerCards.splice(_.findIndex(playerCards, card), 1)
  }

  const startingPlayer = _.sample(players)
  const otherPlayer = findOpponent(startingPlayer)

  const firstInTurn = Bacon.once(onTurn()).map(to(startingPlayer))
  const firstOffTurn = Bacon.once(offTurn()).map(to(otherPlayer))
  const gameStarts = firstInTurn.merge(firstOffTurn)

  const playActions = players.map(player => {
    const opponent = findOpponent(player)
    const playsCard = Bacon.fromEvent(player, 'play-card')
      .doAction(addCardToPlayed)
      .doAction(removeCardFromPlayer(player))

    const playerOffTurns = playsCard.map(offTurn).map(to(player))
    const opponentOnTurns = playsCard.map(onTurn).map(to(opponent))
    return playerOffTurns.merge(opponentOnTurns)
  })

  const toGameState = gameMessage => {
    const opponent = findOpponent(gameMessage.receiver)
    const playerCards = findCards(gameMessage.receiver)
    const opponentCards = findCards(opponent)
    return {...gameMessage, state: {...gameMessage.state, playerCards, opponentCards, cardsPlayed}}
  }

  Bacon.mergeAll([gameStarts, ...playActions]).map(toGameState).onValue(send)
}
