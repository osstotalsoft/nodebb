const nats = require('node-nats-streaming')
const { v4 } = require('uuid')
const Promise = require('bluebird')
const { SubscriptionOptions } = require('../subscriptionOptions')
const { Mutex } = require('async-mutex')

const {
  NATS_CLIENT_ID,
  NATS_CLUSTER,
  NATS_URL,
  NATS_Q_GROUP,
  NATS_DURABLE_NAME,
  NATS_STREAM_PROCESSOR_MaxInflight,
  NATS_STREAM_PROCESSOR_AckWait,
  NATS_PUB_SUB_MaxInflight,
  NATS_PUB_SUB_AckWait,
  NATS_RPC_MaxInflight,
  NATS_RPC_AckWait,
} = process.env

const clientID = `${NATS_CLIENT_ID}-${v4()}`
const connectionMutex = new Mutex()
let connection = null

async function connect() {
  if (connection) {
    return connection
  }

  const release = await connectionMutex.acquire()
  try {
    if (connection) {
      return connection
    }
    const cn = nats.connect(NATS_CLUSTER, clientID, { url: NATS_URL })
    cn.on('error', (err) =>
      console.error(`Nats connection error: ${err}`),
    )
    cn.on('permission_error', (err) =>
      console.error(`Nats connection permission error: ${err}`),
    )
    cn.on('close', () => console.info('🛰️  Nats connection closed.'))
    cn.on('disconnect', () =>
      console.info('🛰️  Nats connection disconnected.'),
    )
    cn.on('reconnect', () =>
      console.info('🛰️  Nats connection reconnected.'),
    )
    cn.on('reconnecting', () =>
      console.info('🛰️  Nats connection reconnecting.'),
    )
    await new Promise((resolve, reject) => {
      cn.on('connect', () => {
        resolve()
      })
      cn.on('error', (err) => {
        reject(err)
      })
    })
    connection = cn
    return connection
  } finally {
    release()
  }
}

async function disconnect() {
  if (!connection) {
    return
  }
  const release = await connectionMutex.acquire()
  try {
    if (!connection) {
      return
    }
    connection.close()
    connection = null
  } finally {
    release()
  }
}

async function publish(subject, msg) {
  const client = await connect()
  const _publish = Promise.promisify(client.publish, {
    context: client,
  })
  const result = await _publish(subject, msg)
  return result
}

async function subscribe(subject, handler, opts) {
  const client = await connect()
  const natsOpts = client.subscriptionOptions()
  let useQGroup = false
  switch (opts) {
    case SubscriptionOptions.STREAM_PROCESSOR:
      useQGroup = true
      natsOpts.setDurableName(NATS_DURABLE_NAME)
      natsOpts.setDeliverAllAvailable()
      natsOpts.setMaxInFlight(
        parseInt(NATS_STREAM_PROCESSOR_MaxInflight, 10) || 1,
      )
      if (NATS_STREAM_PROCESSOR_AckWait) {
        opts.setAckWait(parseInt(NATS_STREAM_PROCESSOR_AckWait, 10))
      }
      natsOpts.setManualAckMode(true)
      break
    case SubscriptionOptions.PUB_SUB:
      useQGroup = true
      natsOpts.setStartAt(nats.StartPosition.NEW_ONLY)
      natsOpts.setMaxInFlight(
        parseInt(NATS_PUB_SUB_MaxInflight, 10) || 100,
      )
      if (NATS_PUB_SUB_AckWait) {
        opts.setAckWait(parseInt(NATS_PUB_SUB_AckWait, 10))
      }
      break
    case SubscriptionOptions.RPC:
      useQGroup = false
      natsOpts.setStartAt(nats.StartPosition.NEW_ONLY)
      natsOpts.setMaxInFlight(parseInt(NATS_RPC_MaxInflight, 10) || 1)
      if (NATS_RPC_AckWait) {
        opts.setAckWait(parseInt(NATS_RPC_AckWait, 10))
      }
      break
    default:
  }

  const subscription = useQGroup
    ? client.subscribe(subject, NATS_Q_GROUP, natsOpts)
    : client.subscribe(subject, natsOpts)

  subscription.on('message', (msg) => {
    handler(msg)
    if (natsOpts.manualAcks) {
      msg.ack()
    }
  })
  subscription.on('error', (err) => {
    console.error(
      `Nats subscription error for subject ${subject}: ${err}`,
    )
  })
  subscription.on('timeout', (err) => {
    console.error(
      `Nats subscription timeout error for subject ${subject}: ${err}`,
    )
  })

  subscription.on('unsubscribed', () => {
    console.info(`Unsubscribed from subject ${subject}.`)
  })

  subscription.on('closed', () => {
    console.info(`Subscription closed for subject ${subject}.`)
  })

  const result = await new Promise((resolve, reject) => {
    subscription.on('ready', () => {
      resolve(wrapSubscription(subscription))
    })
    subscription.on('error', (err) => {
      reject(err)
    })
  })

  return result
}

function wrapSubscription(natsSubscription) {
  return {
    on: natsSubscription.on,
    unsubscribe: function unsubscribe() {
      
      return new Promise((resolve, reject) => {
        natsSubscription.on('unsubscribed', () => {
          resolve()
        })
        natsSubscription.on('error', (err) => {
          reject(err)
        })
        natsSubscription.unsubscribe()
      })
    },
    _natsSubscription: natsSubscription,
  }
}

module.exports = {
  connect,
  disconnect,
  publish,
  subscribe,
}
