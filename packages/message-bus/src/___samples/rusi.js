// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

process.env.Messaging__Transport = 'rusi'
process.env.RUSI_GRPC_PORT = '50003'
process.env.RUSI_PUB_SUB_NAME = 'natsstreaming-pubsub'
const { SubscriptionOptions } = require('..')
const { messageBus } = require('../index')

const msgBus = messageBus()
const topic = 'nodebb.messagebus.sample.rusi.1'

msgBus
  .subscribe(
    topic,
    console.info,
    SubscriptionOptions.STREAM_PROCESSOR,
  )
  .then((sub) => sub.unsubscribe())
  //.then((_sub) => msgBus.publish(topic, { hello: 'world!' }))
  .catch((err) => console.error(err))
