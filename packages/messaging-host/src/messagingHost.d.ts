import { Envelope, SubscriptionOptions } from '@totalsoft/message-bus'

export type MessagingHostMiddleware = (
  ctx: MessagingHostContext,
  next: MessagingHostMiddleware,
) => Promise<void>

export type MessagingHost = {
  /**
   * Hooks a middleware in the message processing pipeline
   * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/messaging-host#middleware-func
   */
  use: (middleware: MessagingHostMiddleware) => MessagingHost
  /**
   * Instructs the messaging host to subscribe to a topic list
   * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/messaging-host#subscriptions
   */
  subscribe: (
    topics: string[],
    opts: SubscriptionOptions,
  ) => MessagingHost
  start: () => Promise<MessagingHost>
  stop: () => Promise<void>
}

export type MessagingHostContext = {
  received: {
    topic: string
    msg: Envelope<any>
  }
}

export function messagingHost(): MessagingHost
