const transport = require("./transport")
const topicRegistry = require("./topicRegistry")
const serDes = require("./serDes")
const { StartPosition } = require("./subscriptionOptions")
const headers = require("./headers")

const messagingSource = process.env.Messaging__Source || ''


async function publish(topic, msg, ctx, envelopeCustomizer = null) {
    const fullTopicName = topicRegistry.getFullTopicName(topic)
    const platformHeaders = {
        [headers.correlationId]: ctx && ctx.correlationId,
        [headers.tenantId]: ctx && ctx.tenant && ctx.tenant.externalId,
        [headers.source]: messagingSource
    }

    const envelope = {
        payload: msg,
        headers: envelopeCustomizer ? envelopeCustomizer(platformHeaders) : platformHeaders
    }
    const data = serDes.serialize(envelope)
    try {
        const result = await transport.publish(fullTopicName, data)
        console.info(`✉   Message published to topic ${fullTopicName}`)
        return result
    }
    catch (err) {
        throw new Error(`Message publishing failed! The following error was encountered: ${err}`)
    }
}

async function subscribe(topic, handler, opts = { useQGroup: true, durable: true, startPosition: StartPosition.FIRST }) {
    const fullTopicName = topicRegistry.getFullTopicName(topic)
    function h(msg) {
        console.info(`✉   Received a message from topic ${fullTopicName}`)
        const data = serDes.deSerialize(msg.getData())
        return handler(data)
    }

    const subscription = await transport.subscribe(fullTopicName, h, opts)
    console.info(`📌  Subscribed to topic ${fullTopicName}`)

    subscription.on('unsubscribed', () => {
        console.info(`📌  Unsubscribed from topic ${fullTopicName}`)
    })

    return subscription
}

async function sendCommandAndReceiveEvent(topic, command, events, ctx, timeoutMs = 20000) {
    let resolveEventReceived = null;
    const subscriptions = await Promise.all(
        events.map(
            eventTopic =>
                subscribe(
                    eventTopic,
                    ev => {
                        if (ev.headers[headers.correlationId] == ctx.correlationId) {
                            resolveEventReceived([eventTopic, ev])
                        }
                    },
                    { useQGroup: false, durable: false, startPosition: StartPosition.NEW_ONLY }
                )
        )
    )

    await publish(topic, command, ctx)

    try {
        const result = await new Promise((resolve, reject) => {
            resolveEventReceived = resolve;
            setTimeout(() => {
                reject(new Error('Message timeout occured.'))
            }, timeoutMs)
        })
        return result

    }
    finally {
        for (const subscription of subscriptions) {
            subscription.unsubscribe()
        }
    }



}

module.exports = {
    publish,
    subscribe,
    sendCommandAndReceiveEvent
}