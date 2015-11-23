require('babel-core/register')
require('colors')

require('./http-server').start(8080)
require('./websocket-server').start(8081)
