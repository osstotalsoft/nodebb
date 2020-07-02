const dispatcher = (handlers) => async (ctx, next) => {
    const { topic } = ctx.received
    const handler = handlers[topic]
    if (handler) {
        await handler(ctx)
    }

    await next()
}

module.exports = dispatcher