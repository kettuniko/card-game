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

  playerConnects
    .bufferWithCount(playersPerGame)
    .onValue(startGame)
}
const offTurn = state => ({...state, inTurn: false})
const onTurn = state => ({...state, inTurn: true})

const startGame = players => {
  const cards = players.map(player => ({id: player.id, cards: chooseRandomCards()}))

  const state = {
    message: 'from-server',
    inTurn: false,
    playerCards: [],
    opponentCards: [],
    cardsPlayed: []
  }
  const initialState = Bacon.constant(state)

  const addCardToTable = card => state.cardsPlayed.push({...card, playId: new Date().getTime()})
  const removeCardFromHand = player => card => {
    const playerCards = findCards(player)
    playerCards.splice(playerCards.indexOf(card))
  }
  const findOpponent = player => players.find(p => p !== player)
  const findCards = player => _.findWhere(cards, {id: player.id}).cards

  const emitState = player => state => {
    const opponent = findOpponent(player)
    const playerCards = findCards(player)
    const opponentCards = findCards(opponent)
    player.emit('game-state', JSON.stringify({...state, playerCards: playerCards, opponentCards: opponentCards}))
  }

  players.forEach(player => {
    const opponent = findOpponent(player)
    const playsCard = Bacon
      .fromEvent(player, 'play-card')
      .doAction(addCardToTable)
      .doAction(removeCardFromHand(player))
      .map(state)

    initialState.onValue(emitState(player))
    playsCard.map(offTurn).onValue(emitState(player))
    playsCard.map(onTurn).onValue(emitState(opponent))
  })
  const startingPlayer = _.sample(players)
  Bacon.once(state).map(onTurn).onValue(emitState(startingPlayer))
}
