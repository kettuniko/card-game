import * as httpServer from './http-server'
import * as webSocketServer from './websocket-server'
import port from './port'

httpServer
  .start(port)
  .then(webSocketServer.start)
