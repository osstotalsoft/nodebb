// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { deadLetterQueue } = require('./deadLetterQueue')

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
