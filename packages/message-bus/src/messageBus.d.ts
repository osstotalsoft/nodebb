// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

import { Context, Envelope, EnvelopeCustomizer } from './envelope'
import { SubscriptionOptions } from './subscriptionOptions'
import { Subscription, Transport } from './transport'

export interface MessageBus {
  /**
   * Envelopes, serializes and publishes a message on a certain topic
   * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/message-bus#publish
   */
  publish<T>(
    topic: string,
    msg: T,
    ctx?: Context,
    envelopeCustomizer?: EnvelopeCustomizer,
  ): Promise<Envelope<T>>

  /**
   * Subscribes a handler to a given topic, with the provided options
   * Deserializes the message before calling the handler
   * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/message-bus#subscribe
   */
  subscribe(
    topic: string,
    handler: (msg: any) => Promise<void>,
    opts?: SubscriptionOptions,
  ): Promise<Subscription>

  /**
   * Implements a form of request/response communication over messaging
   * @see https://github.com/osstotalsoft/nodebb/tree/master/packages/message-bus#request--response-over-messaging
   */
  sendCommandAndReceiveEvent(
    topic: string,
    command: any,
    events: string[],
    ctx?: Context,
    envelopeCustomizer?: EnvelopeCustomizer,
    timeoutMs?: number,
  ): Promise<[string, any]>
}

export function messageBus(): MessageBus
export function useTransport(t: Transport): void
