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
    if (connection) {
      connection.removeListener('error', onConnectionErrorOrClosed)
      connection.removeListener('close', onConnectionErrorOrClosed)
    }

    await Promise.allSettled(
      subscriptions.map((subscription) => subscription.unsubscribe()),
    )
    await messageBus.transport.disconnect()
  }

  function stopImmediate() {
    console.info('Messaging Host is shutting down...')
    if (connection) {
      connection.removeListener('error', onConnectionErrorOrClosed)
      connection.removeListener('close', onConnectionErrorOrClosed)
    }
    try {
      subscriptions.forEach((subscription) => {
        subscription.unsubscribe()
      })
      messageBus.transport.disconnect()
    } catch {
      //there is nothing we can do
    }
  }

  function onConnectionErrorOrClosed() {
    throw new Error('Messaging Host transport connection failure!')
  }

  function _contextFactory(topic, msg) {
    return { received: { topic, msg } }
  }

  return {
    use,
    subscribe,
    start,
    stop,
    stopImmediate,
    _contextFactory,
  }
}

module.exports = { messagingHost }
