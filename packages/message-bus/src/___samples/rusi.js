// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

require('dotenv').config()
const { SubscriptionOptions } = require('..')
const { messageBus, useTransport, transport } = require('../index')

useTransport(transport.rusi)
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
  .catch(err=> console.error(err))
