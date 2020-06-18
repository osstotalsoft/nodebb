const topicPrefix = process.env.Messaging__TopicPrefix || ''

function getFullTopicName(topic) {
    return topicPrefix + topic
}

module.exports = {
    getFullTopicName
}