# messaging-host
Infrastructure for event-driven stream processing microservices

## installation
```javascript
npm install @totalsoft/messaging-host
```

## why use event-driven architecture
An event-driven architecture offers several advantages over REST, which include:

- Asynchronous – event-based architectures are asynchronous without blocking. This allows resources to move freely to the next task once their unit of work is complete, without worrying about what happened before or will happen next. They also allow events to be queued or buffered which prevents consumers from putting back pressure on producers or blocking them.

- Loose Coupling – services don’t need (and shouldn’t have) knowledge of, or dependencies on other services. When using events, services operate independently, without knowledge of other services, including their implementation details and transport protocol. Services under an event model can be updated, tested, and deployed independently and more easily.

- Easy Scaling – Since the services are decoupled under an event-driven architecture, and as services typically perform only one task, tracking down bottlenecks to a specific service, and scaling that service (and only that service) becomes easy.

- Recovery support – An event-driven architecture with a queue can recover lost work by “replaying” events from the past. This can be valuable to prevent data loss when a consumer needs to recover.

Of course, event-driven architectures have drawbacks as well. They are easy to over-engineer by separating concerns that might be simpler when closely coupled; can require a significant upfront investment; and often result in additional complexity in infrastructure, service contracts or schemas, polyglot build systems, and dependency graphs.

Perhaps the most significant drawback and challenge is data and transaction management. Because of their asynchronous nature, event-driven models must carefully handle inconsistent data between services, incompatible versions, watch for duplicate events, and typically do not support ACID transactions, instead supporting eventual consistency which can be more difficult to track or debug.

Even with these drawbacks, an event-driven architecture is usually the better choice for enterprise-level microservice systems. The pros—scalable, loosely coupled, dev-ops friendly design—outweigh the cons.


## sample usage
```javascript
const messagingHost = require("@totalsoft/messaging-host")
const { topics } = require("./myConsts")
const { handleUserPhoneChanged, handleUserEmailChanged } = require("./myEventHandlers")

const msgHandlers = {
    [topics.USER_PHONE_CHANGED]: handleUserPhoneChanged,
    [topics.USER_EMAIL_CHANGED]: handleUserEmailChanged
}

messagingHost()
    .subscribe([
        topics.USER_PHONE_CHANGED,
        topics.USER_EMAIL_CHANGED
    ])
    .use(messagingHost.exceptionHandling())
    .use(messagingHost.correlation())
    .use(messagingHost.dispatcher(msgHandlers))
    .start()
```
```terminal
📌  Subscribed to topic LSNG_RADU.ch.events.UserManagement.PublishedLanguage.Events.PhoneNumberChanged
index.js:42
📌  Subscribed to topic LSNG_RADU.ch.events.UserManagement.PublishedLanguage.Events.EmailChanged
index.js:42
🚀  Messaging host ready
```

## subscriptions
The subscribe function takes an array of topics and an optional subscription options parameter. You can call subscribe multiple times with different subscription options.
```javascript
const messagingHost = require("@totalsoft/messaging-host")
...
messagingHost()
    .subscribe([topics.USER_PHONE_CHANGED],
        messagingHost.subscriptionOptions.STREAM_PROCESSOR)
    .subscribe([topics.USER_PHONE_CHANGED],
        messagingHost.subscriptionOptions.PUB_SUB)
    ...
    .start()
```
As the messaging host calls under the hood the package *@totalsoft/message-bus* for the subscription part, you can read more about the type of messaging subscriptions [here](https://github.com/osstotalsoft/nodebb/tree/master/packages/message-bus#subscribe)

## middleware func
You can customize the message processing pipeline by hooking up your own middleware funcs.
A middleware func has the following typings:
```typescript
export type MessagingHostMiddleware = (
  ctx: MessagingHostContext,
  next: MessagingHostMiddleware,
) => Promise<void>

export interface MessagingHostContext {
  received: {
    topic: string
    msg: Envelope<any>
  }
}

export interface Envelope<T> {
  payload: T
  headers: Headers
}

export interface Headers {
  [propName: string]: any;
}
```
You hook the middlewares with the *use* func:
```javascript
const messagingHost = require("@totalsoft/messaging-host")

messagingHost()
    .subscribe([...])
    .use(someMiddleware)
    .use(otherMiddleware)
    .start()
```

You can mix built-in provided middlewares with custom ones.

## built-in middlewares
The messaging host provides some built-in middlewares
```javascript
messagingHost()
    .subscribe([...])
    .use(messagingHost.exceptionHandling())
    .use(messagingHost.correlation())
    .use(messagingHost.dispatcher(msgHandlers))
    .start()
```
### built-in exception handling middleware
```javascript
messagingHost()
    .subscribe([...])
    .use(messagingHost.exceptionHandling())
    ...
    .start()
```
Typically configured very early in the pipeline, it swallows exceptions and logs them to the console

### built-in correlation middleware
```javascript
messagingHost()
    .subscribe([...])
    ...
    .use(correlation())
    ...
    .start()
```
Typically configured early in the pipeline, it has the role to fetch the correlation id from the received message or create a new one if the incomming message does not have one. It will persist the correlation id in the context obj.

### built-in dispatcher middleware
```javascript
const msgHandlers = {
    [topics.USER_PHONE_CHANGED]: handleUserPhoneChanged,
    [topics.USER_EMAIL_CHANGED]: handleUserEmailChanged
}
messagingHost()
    .subscribe([...])
    ...
    .use(messagingHost.dispatcher(msgHandlers))
    .start()
```
This middleware acts as a message dispatcher (broker) that delivers messages to handlers based a provided *handlers configuration*

You can merge multiple message handler configuration using the utility fn *mergeHandlers*
```javascript
const msgHandlers = messagingHost.dispatcher.mergeHandlers([
    someMessageHandlers, 
    otherMessageHandlers
])
messagingHost()
    ...
    .use(messagingHost.dispatcher(msgHandlers))
    ...
```




