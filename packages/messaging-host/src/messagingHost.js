// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { messageBus } = require('@totalsoft/message-bus')
const { empty, concat, run } = require('./pipeline')

function messagingHost() {
  let subscriptionOptions = {}
  let pipeline = empty
  let subscriptions = null
  let connection = null
  let msgBus = messageBus()

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
    connection = await msgBus.transport.connect()
    connection.on('error', onConnectionErrorOrClosed)
    connection.on('close', onConnectionErrorOrClosed)
    connection.on('reconnect', onConnectionReconnected)

    const subs = Object.entries(subscriptionOptions).map(
      ([topic, opts]) =>
        msgBus.subscribe(
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
    await msgBus.transport.disconnect()
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
      msgBus.transport.disconnect()
    } catch {
      //there is nothing we can do
    }
  }

  function onConnectionErrorOrClosed() {
    throw new Error('Messaging Host transport connection failure!')
  }

  function onConnectionReconnected() {
    // subscriptions.forEach((subscription) => {
    //   subscription.unsubscribe()
    // })
    const subs = Object.entries(subscriptionOptions).map(
      ([topic, opts]) =>
        msgBus.subscribe(
          topic,
          (msg) => run(pipeline, _contextFactory(topic, msg)),
          opts,
        ),
    )
    Promise.all(subs).then((s) => {
      subscriptions = s
    })
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
    _messageBus: msgBus,
  }
}

module.exports = { messagingHost }
