import React from 'react'
import Bacon from 'baconjs'
import socketIO from 'socket.io-client'
const io = socketIO('localhost:8081')

const log = ::console.log
const parseJson = raw => JSON.parse(raw)

const events = eventName => Bacon.fromEvent(io, eventName)
const connects = events('connect')
const disconnects = events('disconnect')
const errors = events('error')
const gameStarts = events('game-start')
const turns = events('turn')

connects.onValue(() => log('connected to server'))
disconnects.onValue(() => log('disconnected from server'))
errors.onValue((err) => log('error', err))
turns.onValue((msg) => log('turn', msg))

const gameStateChanges = gameStarts
  .merge(turns)
  .map(parseJson)
  .map('.gameState')

const playCard = card => () => io.emit('play-card', {card: card})

export const initialState = {
  message: 'waiting for other player',
  players: [{cards: []}, {cards: []}]
}

export const renderPage = applicationState =>
  <body>
    <p id='message'>{applicationState.message}</p>
    <div id='game-area'></div>
    <div id='my-cards'>
      {applicationState.players[0].cards.map(card =>
        <img key={card.name} src={`img/${card.name}.png`} onClick={playCard(card.name)} />
      )}
    </div>
  </body>

export const applicationStateProperty = initialState =>
  gameStateChanges
    .toProperty(initialState)
    .doLog('app state')

export const pagePath = '/'
export const pageTitle = 'Game'
