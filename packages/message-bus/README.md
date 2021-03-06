# message-bus
Provider independent, high-level, opinionated messaging library

## installation
```javascript
npm install @totalsoft/message-bus
```

## philosophy
The message bus is a high level api for messaging communication that abstracts away from its consumers some of the involving complexity like:
 - Messaging transport (Nats, Kafka, etc)
 - Message SerDes
 - Topic Registry
 - Message envelope

## publish
```javascript
const messageBus = require('@totalsoft/message-bus');

const userUpdatedEvent = { userId: 5, userName:'rpopovici' }
const correlationId = 'some-correlation-id'
const tenantId = 'some-tenant-id'

await messageBus.publish('USER_UPDATED', userUpdatedEvent, {correlationId, tenantId});
```

## subscribe
```javascript
const messageBus = require('@totalsoft/message-bus');

const handler = console.log

const subscription = await messageBus.subscribe('USER_UPDATED', handler, messageBus.SubscriptionOptions.STREAM_PROCESSOR)
```
The last optional parameter *subscription options*  is a high level configuration of the subscription type. See below.

## subscription options
When subscribing to a stream you ca opt in one of the following:
 - STREAM_PROCESSOR: typical event driven subscriptions; durable, at-least-once, within a queue group
 - PUB_SUB: lite weight, non-durable, at-most-once, within a queue group
 - RPC: lite weight, non-durable, at-most-once, without queue group, used in send-command-and-wait-for-event scenarios


## request / response over messaging
```javascript
const messageBus = require('@totalsoft/message-bus');

const correlationId = 'some-correlation-id'
const tenantId = 'some-tenant-id'

const updateUserCommand = { userId: 5, userName:'rpopovici' }

const [topic, event] = await messageBus.sendCommandAndReceiveEvent(
    'UPDATE_USER', updateUserCommand,
    ['USER_UPDATED', 'UPDATE_USER_FAILED'],
    {correlationId, tenantId}
)
```

## environment variables
Messaging__TopicPrefix="deprecated_please_use_Messaging__Env"
Messaging__Env="messaging_env"
Messaging__Source="your_service_name"
NATS_URL="your_nats_url"
NATS_CLUSTER="your_nats_cluster"
NATS_CLIENT_ID="your_nats_client_id"
NATS_Q_GROUP="your_q_group"
NATS_DURABLE_NAME="durable"
NATS_STREAM_PROCESSOR_MaxInflight="1"
NATS_STREAM_PROCESSOR_AckWait="5000"
NATS_PUB_SUB_MaxInflight="100"
NATS_PUB_SUB_AckWait="5000"
NATS_RPC_MaxInflight="1"
NATS_RPC_AckWait="5000"


