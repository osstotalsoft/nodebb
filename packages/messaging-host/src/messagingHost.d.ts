import { envelope, subscriptionOptions } from '@totalsoft/message-bus'

export type MessagingHostMiddleware = (
  ctx: MessagingHostContext,
  next: MessagingHostMiddleware,
) => Promise<void>

export interface MessagingHost {
  use: (middleware: MessagingHostMiddleware) => MessagingHost
  subscribe: (
    topics: string[],
    opts: subscriptionOptions.SubscriptionOptions,
  ) => MessagingHost
  start: () => Promise<MessagingHost>
  stop: () => void
}

export interface MessagingHostContext {
  received: {
    topic: string
    msg: envelope.Envelope<any>
  }
}

export function messagingHost(): MessagingHost
