// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const transport = require('./transport')
const topicRegistry = require('./topicRegistry')
const serDes = require('./serDes')
const { SubscriptionOptions } = require('./subscriptionOptions')
const { envelope } = require('./envelope')

const { Messaging__Transport } = process.env

let currentTransport =
  transport[Messaging__Transport] || transport.nats
  
function useTransport(t) {
  currentTransport = t
}

function _messageBus(transport) {
  async function publish(
    topic,
    msg,
    ctx = null,
    envelopeCustomizer = null,
  ) {
    const fullTopicName = topicRegistry.getFullTopicName(topic)

    const envelopedMsg = envelope(msg, ctx, envelopeCustomizer)
    //const data = serDes.serialize(envelopedMsg)
    try {
      await transport.publish(fullTopicName, envelopedMsg, serDes)
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
    function h(e) {
      setImmediate(_=>{console.info(`✉   Received a message from ${fullTopicName}`)})
      return handler(e)
    }

    const subscription = await transport.subscribe(
      fullTopicName,
      h,
      opts,
      serDes,
    )
    console.info(`📌  Subscribed to ${fullTopicName}`)

    return subscription
  }

  async function sendCommandAndReceiveEvent(
    topic,
    command,
    events,
    ctx = null,
    envelopeCustomizer = null,
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
          SubscriptionOptions.RPC,
        ),
      ),
    )

    publishedMsg = await publish(
      topic,
      command,
      ctx,
      envelopeCustomizer,
    )

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

  return {
    publish,
    subscribe,
    sendCommandAndReceiveEvent,
    transport,
  }
}

function messageBus() {
  return _messageBus(currentTransport)
}

module.exports = {
  messageBus,
  useTransport,
}
