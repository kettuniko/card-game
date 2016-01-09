import port from './port'

const config = {
  development: {
    gameServerHost: `localhost:${port}`
  },
  production: {
    gameServerHost: 'evening-refuge-7020.herokuapp.com'
  }
}

const environment = process.env.NODE_ENV || 'development'
console.log(`Using ${environment} configuration`.yellow)
export default config[environment]
