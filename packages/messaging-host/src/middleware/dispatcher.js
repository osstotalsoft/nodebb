const {
  keys,
  union,
  map,
  fromPairs,
  pipe,
  apply,
  reduce,
} = require('ramda')

const dispatcher = (handlers) => async (ctx, next) => {
  const { topic } = ctx.received
  const handler = handlers[topic]
  if (handler) {
    await handler(ctx)
  }

  await next()
}

function mergeHandlers(xHandlers, yHandlers) {
  function concat(h1, h2) {
    return async (...args) => {
      await h1(...args)
      await h2(...args)
    }
  }

  const getTopicHandler = (topic) => {
    const x = xHandlers[topic]
    const y = yHandlers[topic]

    const handler = x && y ? concat(x, y) : x || y

    return [topic, handler]
  }

  const mergeHandlers = pipe(
    map(keys),
    apply(union),
    map(getTopicHandler),
    fromPairs,
  )

  return mergeHandlers([xHandlers, yHandlers])
}

dispatcher.mergeHandlers = reduce(mergeHandlers, {})

module.exports = dispatcher
