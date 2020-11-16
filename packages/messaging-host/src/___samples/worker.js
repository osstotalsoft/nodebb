process.env.NATS_CLIENT_ID = 'nodebb_sample'
process.env.NATS_Q_GROUP = 'nodebb_sample'

const { messagingHost, SubscriptionOptions } = require('../index')
//const messageBus = require('@totalsoft/message-bus')

const topics = ['nodebb.sample.topic.1', 'nodebb.sample.topic.2']

messagingHost()
  .subscribe(topics, SubscriptionOptions.PUB_SUB)
  .use(async (ctx, next) => {
    console.log(`received msg from topic ${ctx.received.topic}`)
    await next()
  })
  .start()
  // .then(() => {
  //   //host.stop()
  //   setInterval(() => {
  //     messageBus.transport.connect().then((connection) => {
  //       connection.close()
  //     })
  //   }, 5000)
  // })
// setTimeout(()=>{
//   throw new Error("some error")
// }, 5000)