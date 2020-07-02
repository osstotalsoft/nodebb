const messagingHost = require('./messagingHost')
const {
  correlation,
  dispatcher,
  exceptionHandling,
} = require('./middleware')

messagingHost.correlation = correlation
messagingHost.dispatcher = dispatcher
messagingHost.exceptionHandling = exceptionHandling

module.exports = messagingHost
