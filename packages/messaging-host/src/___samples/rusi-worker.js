// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

// process.env.NATS_CLIENT_ID = 'nodebb_sample'
// process.env.NATS_Q_GROUP = 'nodebb_sample'

process.env.Messaging__Transport = 'rusi'
process.env.RUSI_GRPC_ENDPOINT = 'localhost:50003'
process.env.RUSI_PUB_SUB_NAME = 'natsstreaming-pubsub'

const { messagingHost, SubscriptionOptions } = require('../index')

const topics = ['nodebb.sample.topic.1', 'nodebb.sample.topic.2']

const msgHost = messagingHost()
msgHost
  .subscribe(topics, SubscriptionOptions.PUB_SUB)
  .use(async (ctx, next) => {
    console.log(`received msg from topic ${ctx.received.topic}`)
    await next()
  })
  .start()
  .then(() => {
    //host.stop()
    setInterval(() => {
      msgHost._messageBus.publish(topics[0], { hello: 'world' })
    }, 1000)
  })
// .then(() => {
//   //host.stop()
//   setTimeout(() => {
//     msgHost._messageBus.transport.disconnect()
//   }, 5000)
// })

process.on('uncaughtException', function (error, origin) {
  msgHost.stopImmediate()
  throw new Error(
    `Exception occurred while processing the request: ${error}\n` +
      `Exception origin: ${origin}`,
  )
})

process.on('SIGINT', () => {
  msgHost.stopImmediate()
})
process.on('SIGTERM', () => {
  msgHost.stopImmediate()
})

// setTimeout(()=>{
//   throw new Error("some error")
// }, 5000)
