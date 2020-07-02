const { uuid } = require('uuidv4')
const { envelope } = require('@totalsoft/message-bus')

const correlation = () => async (ctx, next) => {
  if (!ctx.correlationId) {
    const correlationId =
      envelope.getCorrelationId(ctx.received.msg) || uuid()
    ctx.correlationId = correlationId
  }

  await next()
}

module.exports = correlation
