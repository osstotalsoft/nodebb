// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

const topicPrefix =
  (process.env.Messaging__Env
    ? process.env.Messaging__Env + '.'
    : null) ||
  process.env.Messaging__TopicPrefix ||
  ''

function getFullTopicName(topic) {
  return topicPrefix + topic
}

module.exports = {
  getFullTopicName,
}
