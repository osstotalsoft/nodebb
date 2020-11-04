const transport = require('./transport')
const topicRegistry = require('./topicRegistry')
const serDes = require('./serDes')
const { SubscriptionOptions } = require('./subscriptionOptions')
const { envelope } = require('./envelope')

async function publish(
  topic,
  msg,
  ctx = null,
  envelopeCustomizer = null,
) {
  const fullTopicName = topicRegistry.getFullTopicName(topic)

  const envelopedMsg = envelope(msg, ctx, envelopeCustomizer)
  const data = serDes.serialize(envelopedMsg)
  try {
    await transport.publish(fullTopicName, data)
    console.info(`✉   Message published to topic ${fullTopicName}`)
    return envelopedMsg
  } catch (err) {
    throw new Error(
      `Message publishing failed! The following error was encountered: ${err}`,
    )
  }
}

async function subscribe(
  topic,
  handler,
  opts = SubscriptionOptions.STREAM_PROCESSOR,
) {
  const fullTopicName = topicRegistry.getFullTopicName(topic)
  function h(msg) {
    console.info(`✉   Received a message from ${fullTopicName}`)
    const data = serDes.deSerialize(msg.getData())
    return handler(data)
  }

  const subscription = await transport.subscribe(
    fullTopicName,
    h,
    opts,
  )
  console.info(`📌  Subscribed to ${fullTopicName}`)

  return subscription
}

async function sendCommandAndReceiveEvent(
  topic,
  command,
  events,
  ctx = null,
  timeoutMs = 20000,
) {
  let resolveEventReceived = null
  let publishedMsg = null

  const subscriptions = await Promise.all(
    events.map((eventTopic) =>
      subscribe(
        eventTopic,
        (ev) => {
          if (
            envelope.getCorrelationId(ev) ==
            envelope.getCorrelationId(publishedMsg)
          ) {
            resolveEventReceived([eventTopic, ev])
          }
        },
        SubscriptionOptions.PUB_SUB,
      ),
    ),
  )

  publishedMsg = await publish(topic, command, ctx)

  try {
    const result = await new Promise((resolve, reject) => {
      resolveEventReceived = resolve
      setTimeout(() => {
        reject(new Error('Message timeout occured.'))
      }, timeoutMs)
    })
    return result
  } finally {
    for (const subscription of subscriptions) {
      subscription.unsubscribe()
    }
  }
}

module.exports = {
  publish,
  subscribe,
  sendCommandAndReceiveEvent,
}
