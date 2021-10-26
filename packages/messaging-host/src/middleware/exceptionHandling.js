// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { envelope, messageBus } = require('@totalsoft/message-bus')

const deadLetterQueue = () => {

  const push = async (ctx, error) => {
    const msgBus = messageBus()

    let payload = {
      exceptionType: typeof (error),
      errorMessage: error.message,
      stackTrace: error.stack,
      source: "",
      data: ctx.received.msg,
      originalTopic: ctx.received.topic,
      originalSystem: envelope.getSource(ctx.received.msg),
      correlationId: envelope.getCorrelationId(ctx.received.msg),
      messageType: "",//message type header
      publishTime: new Date(), // publish time hader???
      messageId: "", //the message id header??
    }

    await msgBus.publish("_error", payload, ctx)
  }

  return {
    push
  }
}

const exceptionHandling = () => async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    console.error(
      `Error occured when message received from topic ${ctx.received.topic}: ${error}`,
    )

    const dlq = deadLetterQueue()
    dlq.push(ctx, error)
      .catch(err => console.error(`Error publishing to dead letter queue: ${err}`))
  }
}

module.exports = { exceptionHandling }
