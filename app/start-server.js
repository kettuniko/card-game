import * as httpServer from './http-server'
import * as gameServer from './game-server'
import port from './port'

httpServer
  .start(port)
  .then(gameServer.start)
