import React from 'react'
import Bacon from 'baconjs'
import socketIO from 'socket.io-client'
const io = socketIO('localhost:8081');

export const pagePath = '/'
export const pageTitle = 'Game'

export const initialState = {
  message: 'waiting for other player',
  players: [{cards: []}, {cards: []}]
}

export const renderPage = applicationState =>
  <body>
    <p id="message">{applicationState.message}</p>
    <div id="game-area"></div>
    <div id="my-cards">
      {applicationState.players[0].cards}
    </div>
  </body>

const events = eventName => Bacon.fromEvent(io, eventName)
const parseJson = raw => JSON.parse(raw)

const connects = events('connect')
const disconnects = events('disconnect')
const errors = events('error')
const gameStarts = events('game-start')
const turns = events('turn')

connects.onValue(() => console.log('connected to server'))
disconnects.onValue(() => console.log('disconnected from server'))
errors.onValue((err) => console.log('error', err))

const imageNamesToElements = gameState => Object.assign(gameState, mapAllCardsToElements(gameState))
const mapAllCardsToElements = gameState => Object.assign(gameState, {players: gameState.players.map(playerCardsToElements)})
const playerCardsToElements = player => Object.assign(player, {cards: player.cards.map(cardToElement)})
const cardToElement = card => <img key={card.name} src={`img/${card.name}.png`} onClick={playCard(card.name)} />
const playCard = card => () => io.emit('play-card', {card: card})

const gameStateChanges = gameStarts
  .merge(turns)
  .map(parseJson)
  .map('.gameState')
  .map(imageNamesToElements)

turns.onValue((msg) => console.log('turn', msg))

export const applicationStateProperty = initialState => gameStateChanges
  .toProperty(initialState)
  .doLog('app state')