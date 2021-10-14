// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { messageBus } = require('@totalsoft/message-bus')
const { empty, concat, run } = require('./pipeline')
const polly = require('polly-js')
const EventEmitter = require('events')

const {
  Messaging__Host__ConnectionErrorStrategy,
  Messaging__Host__StartRetryCount,
} = process.env

function messagingHost() {
  let subscriptionOptions = {}
  let pipeline = empty
  let msgBus = messageBus()
  let subscriptions = null
  let connection = null
  let msgHost = null
  let connectionErrorHandler = function connectionErrorHandler(err) {
    const h =
      connectionErrorStrategy[
        Messaging__Host__ConnectionErrorStrategy
      ] || connectionErrorStrategy.retry
    h(err, connection, msgHost)
  }

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

  function onConnectionError(handler) {
    connectionErrorHandler = function connectionErrorHandler(err) {
      handler(err, connection, msgHost)
    }
    return this
  }

  async function _start({ count }) {
    const action = count == 0 ? 'starting' : `re-starting(${count})`
    console.info(`Messaging Host is ${action}...`)
    msgHost.emit('starting', { count })

    connection = await msgBus.transport.connect()
    connection.on('error', connectionErrorHandler)
    connection.on('close', connectionErrorHandler)

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
    msgHost.emit('started', { count })
    return this
  }

  async function start() {
    await polly()
      .logger(console.error)
      .waitAndRetry(
        parseInt(Messaging__Host__StartRetryCount, 10) || 10,
      )
      .executeForPromise(_start)
  }

  async function stop() {
    console.info('Messaging Host is shutting down...')
    msgHost.emit('stopping')

    if (connection) {
      connection.removeListener('error', connectionErrorHandler)
      connection.removeListener('close', connectionErrorHandler)
    }

    await Promise.allSettled(
      subscriptions.map((subscription) => subscription.unsubscribe()),
    )
    await msgBus.transport.disconnect()
    msgHost.emit('stopped')
  }

  function stopImmediate() {
    console.info('Messaging Host is shutting down...')
    if (connection) {
      connection.removeListener('error', connectionErrorHandler)
      connection.removeListener('close', connectionErrorHandler)
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

  function _contextFactory(topic, msg) {
    return { received: { topic, msg } }
  }

  msgHost = Object.assign(new EventEmitter(), {
    use,
    subscribe,
    onConnectionError,
    start,
    stop,
    stopImmediate,
    _contextFactory,
    _messageBus: msgBus,
  })

  return msgHost
}

const connectionErrorStrategy = {
  throw: function throwOnConnectionError() {
    throw new Error('Messaging Host transport connection failure!')
  },
  retry: function retryOnConnectionError(_err, _cn, msgHost) {
    msgHost
      .stop()
      .catch(console.error)
      .then(msgHost.start)
      .catch((err) => {
        console.error(err)
        setImmediate(() => {
          throw new Error(
            'Messaging Host transport connection failure!',
          )
        })
      })
  },
}

module.exports = { messagingHost, connectionErrorStrategy }
