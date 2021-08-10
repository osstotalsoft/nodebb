// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { v4 } = require('uuid')
const { envelope } = require('@totalsoft/message-bus')

const correlation = () => async (ctx, next) => {
  if (!ctx.correlationId) {
    const correlationId =
      envelope.getCorrelationId(ctx.received.msg) || v4()
    ctx.correlationId = correlationId
  }

  await next()
}

module.exports = { correlation }
