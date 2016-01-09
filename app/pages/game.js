import React from 'react'
import Bacon from 'baconjs'
import socketIO from 'socket.io-client'
import port from '../port'
const io = socketIO(`localhost:${port}`)

const log = ::console.log
const parseJson = raw => JSON.parse(raw)

const events = eventName => Bacon.fromEvent(io, eventName)
const connects = events('connect')
const disconnects = events('disconnect')
const errors = events('error')
const gameStates = events('game-state')
const turns = events('turn')

connects.onValue(() => log('connected to server'))
disconnects.onValue(() => log('disconnected from server'))
errors.onValue((err) => log('error', err))
turns.onValue((msg) => log('turn', msg))

const gameStateChanges = gameStates
  .map(parseJson)

const playCard = card => () => io.emit('play-card', {name: card})

export const initialState = {
  inTurn: false,
  playerCards: [],
  opponentCards: [],
  cardsPlayed: []
}

export const renderPage = applicationState =>
  <body>
    <div className='cards' id='opponent-cards'>
      {applicationState.opponentCards.map(card =>
        <img key={card.name} src={`img/${card.name}.png`} />
      )}
    </div>

    <div className='cards' id='game-area'>
      {applicationState.cardsPlayed.map(card =>
        <img key={card.playId} src={`img/${card.name}.png`} />
      )}
    </div>

    <div className='cards' id='player-cards'>
      {applicationState.playerCards.map(card =>
        <img key={card.name} src={`img/${card.name}.png`} onClick={applicationState.inTurn ? playCard(card.name) : undefined} />
      )}
    </div>
    {applicationState.inTurn ? 'your turn' : 'opponents turn'}
  </body>

export const applicationStateProperty = initialState =>
  gameStateChanges
    .toProperty(initialState)
    .doLog('app state')

export const pagePath = '/'
export const pageTitle = 'Game'
