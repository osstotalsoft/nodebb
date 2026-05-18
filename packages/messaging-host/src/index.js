// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const { messagingHost, errorStrategy } = require('./messagingHost')
const {
  correlation,
  dispatcher,
  exceptionHandling,
} = require('./middleware')
const { SubscriptionOptions } = require('@totalsoft/message-bus')

module.exports = {
  messagingHost,
  errorStrategy,
  correlation,
  dispatcher,
  exceptionHandling,
  SubscriptionOptions,
}
