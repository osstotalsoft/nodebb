import { Envelope, subscriptionOptions } from '@totalsoft/message-bus'

export type MessagingHostMiddleware = (
  ctx: MessagingHostContext,
  next: MessagingHostMiddleware,
) => Promise<void>

export interface MessagingHost {
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
    opts: subscriptionOptions,
  ) => MessagingHost
  start: () => Promise<MessagingHost>
  stop: () => void
}

export interface MessagingHostContext {
  received: {
    topic: string
    msg: Envelope<any>
  }
}

export default function messagingHost(): MessagingHost
