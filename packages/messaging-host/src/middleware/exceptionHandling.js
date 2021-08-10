// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const exceptionHandling = () => async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    console.error(
      `Error occured when message received from topic ${ctx.received.topic}: ${error}`,
    )
  }
}

module.exports = { exceptionHandling }
