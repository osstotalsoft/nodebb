const messageBus = require('@totalsoft/message-bus')
const { empty, concat, run } = require('./pipeline')

function messagingHost() {
  let subscriptionOptions = {}
  let pipeline = empty
  let subscriptions = null

  function use(middleware) {
    pipeline = concat(middleware, pipeline)
    return this
  }

  function subscribe(topics, opts) {
    for (const topic of topics) {
      subscriptionOptions[topic] = opts
    }
    return this
  }

  async function start() {
    let subs = Object.entries(
      subscriptionOptions,
    ).map(([topic, opts]) =>
      messageBus.subscribe(
        topic,
        (msg) => run(pipeline, _contextFactory(topic, msg)),
        opts,
      ),
    )
    subscriptions = await Promise.all(subs)
    console.info(`🚀  Messaging host ready`)
    return this
  }

  function stop() {
    for (const subscription of subscriptions) {
      subscription.unsubscribe()
    }
  }

  function _contextFactory(topic, msg) {
    return { received: { topic, msg } }
  }

  return {
    use,
    subscribe,
    start,
    stop,
    _contextFactory,
  }
}

module.exports = { messagingHost }
