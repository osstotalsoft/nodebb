const messagingHost = require('./messagingHost')
const {
  tenantIdentification,
  correlation,
  dbInstance,
  dispatcher,
  tracing,
  exceptionHandling,
} = require('./middleware')

messagingHost.tenantIdentification = tenantIdentification
messagingHost.correlation = correlation
messagingHost.dbInstance = dbInstance
messagingHost.tracing = tracing
messagingHost.dispatcher = dispatcher
messagingHost.exceptionHandling = exceptionHandling

module.exports = messagingHost
