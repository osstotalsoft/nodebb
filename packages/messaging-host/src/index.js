const messagingHost = require('./messagingHost')
const {
  correlation,
  dispatcher,
  exceptionHandling,
} = require('./middleware')
const { subscriptionOptions } = require('@totalsoft/message-bus')

messagingHost.correlation = correlation
messagingHost.dispatcher = dispatcher
messagingHost.exceptionHandling = exceptionHandling
messagingHost.subscriptionOptions = subscriptionOptions

module.exports = messagingHost
