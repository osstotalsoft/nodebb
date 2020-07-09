const nats = require('node-nats-streaming')
const { uuid } = require('uuidv4')
const Promise = require('bluebird')
const { SubscriptionOptions } = require('../subscriptionOptions')
const { Mutex } = require('async-mutex')

const {
  NATS_CLIENT_ID,
  NATS_CLUSTER,
  NATS_URL,
  NATS_Q_GROUP,
  NATS_DURABLE_NAME,
} = process.env

const clientID = `${NATS_CLIENT_ID}-${uuid()}`
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
  if (opts == SubscriptionOptions.STREAM_PROCESSOR) {
    natsOpts.setDurableName(NATS_DURABLE_NAME)
    natsOpts.setDeliverAllAvailable()
  } else {
    natsOpts.setStartAt(nats.StartPosition.NEW_ONLY)
  }

  const result = await new Promise((resolve, reject) => {
    const subscription =
      opts == SubscriptionOptions.STREAM_PROCESSOR
        ? client.subscribe(subject, NATS_Q_GROUP, natsOpts)
        : client.subscribe(subject, natsOpts)

    subscription.on('message', handler)

    subscription.on('ready', () => {
      resolve(subscription)
    })
    subscription.on('error', (err) => {
      reject(err)
    })
  })

  return result
}

module.exports = {
  connect,
  publish,
  subscribe,
}
