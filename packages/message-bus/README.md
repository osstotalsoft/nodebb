# message-bus
Provider independent, high-level, opinionated messaging library

## Installation
```javascript
npm install @totalsoft/message-bus
```

## Philosophy
The message bus is a high level api for messaging communication that abstracts away from its consumers some of the involving complexity like:
 - Messaging transport (Nats, Kafka, etc)
 - Message SerDes
 - Topic Registry
 - Message envelope

## Publish
```javascript
const { messageBus } = require('@totalsoft/message-bus');

const userUpdatedEvent = { userId: 5, userName:'rpopovici' }
const correlationId = 'some-correlation-id'
const tenantId = 'some-tenant-id'

await messageBus.publish('USER_UPDATED', userUpdatedEvent, {correlationId, tenantId});
```

## Subscribe
```javascript
const { messageBus, subscriptionOptions } = require('@totalsoft/message-bus');

const handler = console.log

const subscription = await messageBus.subscribe('USER_UPDATED', handler, subscriptionOptions.STREAM_PROCESSOR)
```

## Request / Response over messaging
```javascript
const { messageBus } = require('@totalsoft/message-bus');

const correlationId = 'some-correlation-id'
const tenantId = 'some-tenant-id'

const updateUserCommand = { userId: 5, userName:'rpopovici' }

const [topic, event] = await this.sendCommandAndReceiveEvent(
    'UPDATE_USER', updateUserCommand,
    ['USER_UPDATED', 'UPDATE_USER_FAILED'],
    {correlationId, tenantId}
)
```

## Environment variables
Messaging__Source="your_service_name"
Messaging__TopicPrefix="messaging_env"
NATS_URL="your_nats_url"
NATS_CLUSTER="your_nats_cluster"
NATS_CLIENT_ID="your_nats_client_id"
NATS_Q_GROUP="your_q_group"
NATS_DURABLE_NAME="durable"


