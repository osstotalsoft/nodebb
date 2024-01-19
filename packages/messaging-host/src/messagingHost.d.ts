// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

import {
  Envelope,
  SubscriptionOptions,
  transport,
} from '@totalsoft/message-bus'

export type MessagingHostMiddleware = (
  ctx: MessagingHostContext,
  next: MessagingHostMiddleware,
) => Promise<void>

/**
 * Represents the messaging host that handles message processing and subscriptions.
 */
export type MessagingHost = {
  /**
   * Hooks a middleware in the message processing pipeline.
   * @param middleware - The middleware function to be hooked.
   * @returns The messaging host instance.
   * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/messaging-host#middleware-func
   */
  use: (middleware: MessagingHostMiddleware) => MessagingHost

  /**
   * Instructs the messaging host to subscribe to a topic list.
   * @param topics - The list of topics to subscribe to.
   * @param opts - The subscription options.
   * @returns The messaging host instance.
   * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/messaging-host#subscriptions
   */
  subscribe: (
    topics: string[],
    opts: SubscriptionOptions,
  ) => MessagingHost

  /**
   * Sets the handler for connection errors.
   * @param handler - The connection error strategy.
   * @returns The messaging host instance.
   */
  onConnectionError: (
    handler: ConnectionErrorStrategy,
  ) => MessagingHost

  /**
   * Starts the messaging host.
   * @returns A promise that resolves to the messaging host instance.
   */
  start: () => Promise<MessagingHost>

  /**
   * Stops the messaging host.
   * @returns A promise that resolves when the messaging host is stopped.
   */
  stop: () => Promise<void>

  /**
   * Stops the messaging host immediately without waiting for pending operations to complete.
   */
  stopImmediate: () => void

  /**
   * Checks if the messaging host is running.
   * @returns A boolean indicating whether the messaging host is running or not.
   */
  isRunning: () => boolean
}

export type MessagingHostContext = {
  received: {
    topic: string
    msg: Envelope<any>
  }
}

export function messagingHost(): MessagingHost

export type ConnectionErrorStrategy = (
  err: Error,
  cn: transport.Connection,
  msgHost: MessagingHost,
) => void
export interface ConnectionErrorStrategies {
  throw: ConnectionErrorStrategy
  retry: ConnectionErrorStrategy
}
export const connectionErrorStrategy: ConnectionErrorStrategies
