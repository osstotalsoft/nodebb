const messageBus = require('@totalsoft/message-bus')
const { empty, concat, run } = require('./pipeline')

function messagingHost() {
  let subscriptionOptions = {}
  let pipeline = empty
  let subscriptions = null
  let connection = null

  function use(middleware) {
    pipeline = concat(middleware, pipeline)
    return this
  }

  function subscribe(topics, opts) {
    for (const topic of topics) {
      subscriptionOptions[topic] = opts
    }
    return this
  }

  async function start() {
    connection = await messageBus.transport.connect()
    connection.on('error', onConnectionErrorOrClosed)
    connection.on('close', onConnectionErrorOrClosed)
    // process.on('SIGINT', onShutdownSignalReceived)
    // process.on('SIGTERM', onShutdownSignalReceived)
    // process.on('uncaughtException', onUncaughtException)

    const subs = Object.entries(
      subscriptionOptions,
    ).map(([topic, opts]) =>
      messageBus.subscribe(
        topic,
        (msg) => run(pipeline, _contextFactory(topic, msg)),
        opts,
      ),
    )
    subscriptions = await Promise.all(subs)
    console.info(`🚀  Messaging host ready`)
    return this
  }

  async function stop() {
    console.info('Messaging Host is shutting down...')
    connection.removeListener('error', onConnectionErrorOrClosed)
    connection.removeListener('close', onConnectionErrorOrClosed)
    // process.removeListener('SIGINT', onShutdownSignalReceived)
    // process.removeListener('SIGTERM', onShutdownSignalReceived)
    // process.removeListener('uncaughtException', onUncaughtException)

    await Promise.allSettled(
      subscriptions.map((subscription) => subscription.unsubscribe()),
    )
    await messageBus.transport.disconnect()
  }

  function onConnectionErrorOrClosed() {
    return stop().then(start)
  }

  // function onShutdownSignalReceived() {
  //   stop()
  // }

  // function onUncaughtException(err, origin) {
  //   stop().then(() => {
  //     throw new Error(`Exception occurred: ${err}\n` + `Exception origin: ${origin}`)
  //   })
  // }

  function _contextFactory(topic, msg) {
    return { received: { topic, msg } }
  }

  return {
    use,
    subscribe,
    start,
    stop,
    _contextFactory,
  }
}

module.exports = { messagingHost }
