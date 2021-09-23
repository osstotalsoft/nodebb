// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

process.env.Messaging__Transport = 'nats'
process.env.Messaging__Source="nodebb-nats-sample"
process.env.NATS_CLIENT_ID="your_nats_client_id"
process.env.NATS_Q_GROUP="your_q_group"
process.env.NATS_DURABLE_NAME="durable"
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
  //.then((sub) => sub.unsubscribe())
  .then((_sub) => msgBus.publish(topic, { hello: 'world!' }))
  .catch((err) => console.error(err))
